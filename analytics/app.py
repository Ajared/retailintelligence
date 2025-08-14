import streamlit as st
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
import hmac
import uuid
from datetime import datetime
import warnings
from dotenv import load_dotenv

load_dotenv()


def _make_arrow_compatible(df: pd.DataFrame) -> pd.DataFrame:
    """Return a copy of df with Arrow-friendly dtypes.

    - Convert UUID objects to strings
    - Convert object-dtype datetime-like values to pandas datetime64[ns]
      and drop timezone info for consistency
    - Normalize mixed-type object columns where most values parse as datetimes
    - Apply convert_dtypes for cleaner integer/boolean/string dtypes
    """
    if df is None:
        return df

    result = df.copy()

    for column_name in result.columns:
        series = result[column_name]

        # Only coerce object-typed columns
        if series.dtype == object:
            non_null_series = series.dropna()
            if non_null_series.empty:
                continue

            sample_value = non_null_series.iloc[0]

            # UUIDs → strings
            if isinstance(sample_value, uuid.UUID) or (
                non_null_series.map(lambda v: isinstance(v, uuid.UUID)).all()
            ):
                result[column_name] = series.map(
                    lambda v: str(v) if isinstance(v, uuid.UUID) else v
                )
                continue

            # Datetime-like objects held in object dtype → proper datetime64
            if non_null_series.map(
                lambda v: isinstance(v, (pd.Timestamp, datetime))
            ).all():
                with warnings.catch_warnings():
                    warnings.simplefilter("ignore", UserWarning)
                    coerced = pd.to_datetime(
                        series, errors="coerce", utc=False, format="ISO8601"
                    )
                try:
                    # If timezone-aware, convert to naive
                    if getattr(coerced.dt, "tz", None) is not None:
                        coerced = coerced.dt.tz_localize(None)
                except Exception:
                    pass
                result[column_name] = coerced
                continue

            # Mixed but largely datetime-parsable values
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                coerced_guess = pd.to_datetime(
                    series, errors="coerce", utc=False, format="ISO8601"
                )
            if coerced_guess.notna().sum() >= max(1, int(0.8 * len(non_null_series))):
                try:
                    if getattr(coerced_guess.dt, "tz", None) is not None:
                        coerced_guess = coerced_guess.dt.tz_localize(None)
                except Exception:
                    pass
                result[column_name] = coerced_guess

    # General dtype cleanup (nullable ints, booleans, strings)
    result = result.convert_dtypes()

    # Ensure no lingering UUID objects in any object/string columns
    for column_name in result.columns:
        series = result[column_name]
        if series.dtype == object:
            non_null_series = series.dropna()
            if (
                not non_null_series.empty
                and non_null_series.map(lambda v: isinstance(v, uuid.UUID)).any()
            ):
                result[column_name] = series.map(
                    lambda v: str(v) if isinstance(v, uuid.UUID) else v
                )

    return result


class PostgreSQLAnalyzer:
    def __init__(self):
        self.engine = None
        self.connection = None

    def connect(self):
        """Connect to PostgreSQL database using environment variables"""
        try:
            db_config = {
                "host": os.getenv("DB_HOST", "localhost"),
                "port": os.getenv("DB_PORT", "5432"),
                "database": os.getenv("DB_NAME"),
                "user": os.getenv("DB_USER"),
                "password": os.getenv("DB_PASSWORD"),
            }
            # Build connection string from environment variables (do not hardcode secrets)
            # Ensure you have a .env file with DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD (not committed to git)
            connection_string = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            self.engine = create_engine(connection_string)
            self.connection = self.engine.connect()
            return True
        except Exception as e:
            st.error(f"Error connecting to database: {e}")
            return False

    def execute_query(self, query):
        """Execute SQL query and return pandas DataFrame"""
        try:
            df = pd.read_sql_query(query, self.connection)
            return df
        except Exception as e:
            st.error(f"Error executing query: {e}")
            return None

    def get_tables(self):
        """Get list of tables in the database"""
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name;
        """
        return self.execute_query(query)

    def get_table_info(self, table_name):
        """Get basic information about a table"""
        query = f"""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '{table_name}'
        ORDER BY ordinal_position;
        """
        return self.execute_query(query)

    def get_table_sample(self, table_name, limit=100):
        """Get a sample of data from a table"""
        query = f"SELECT * FROM {table_name} LIMIT {limit};"
        return self.execute_query(query)

    def get_row_count(self, table_name):
        """Get row count for a table"""
        query = f"SELECT COUNT(*) as row_count FROM {table_name};"
        return self.execute_query(query)

    def close_connection(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()


def main():
    st.set_page_config(page_title="PostgreSQL Data Analyzer", layout="wide")

    st.title("PostgreSQL Data Analyzer")
    st.markdown("Analyze your PostgreSQL database with interactive visualizations")

    # Initialize analyzer
    if "analyzer" not in st.session_state:
        st.session_state.analyzer = PostgreSQLAnalyzer()

    # Authentication & background connection via admin secret
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    if "connected" not in st.session_state:
        st.session_state.connected = False
    if "admin_prompt_active" not in st.session_state:
        st.session_state.admin_prompt_active = True

    if not st.session_state.authenticated:
        if st.session_state.admin_prompt_active:
            st.header("Admin Access")
            with st.form("admin_secret_form"):
                admin_secret_input = st.text_input("Admin Secret", type="password")
                unlock_button = st.form_submit_button("Unlock")

            if unlock_button:
                expected_secret = os.getenv("ADMIN_SECRET", "")
                if not expected_secret:
                    st.error("Server misconfiguration: ADMIN_SECRET is not set.")
                    st.session_state.admin_prompt_active = False
                elif hmac.compare_digest(admin_secret_input or "", expected_secret):
                    with st.spinner("Verifying and connecting..."):
                        if st.session_state.analyzer.connect():
                            st.success("Connected to database successfully!")
                            st.session_state.connected = True
                            st.session_state.authenticated = True
                        else:
                            st.session_state.connected = False
                    st.session_state.admin_prompt_active = False
                else:
                    st.error("Invalid admin secret.")
                    st.session_state.admin_prompt_active = False
        else:
            if not st.session_state.connected:
                st.info("Access restricted. Refresh the page to try again.")

    # Stop rendering the rest of the app until a successful connection is established
    if not st.session_state.get("connected", False):
        st.stop()

    # Main analysis section
    if st.session_state.get("connected", False):
        st.header("Data Analysis")

        # Get tables
        tables_df = st.session_state.analyzer.get_tables()
        if tables_df is not None and not tables_df.empty:
            table_names = tables_df["table_name"].tolist()

            # Table selection
            selected_table = st.selectbox("Select a table to analyze:", table_names)

            if selected_table:
                # Create tabs for different analysis types
                tab1, tab2, tab3, tab4 = st.tabs(
                    ["Table Info", "Data Preview", "Statistics", "Visualizations"]
                )

                with tab1:
                    st.subheader(f"Table Information: {selected_table}")

                    # Table structure
                    table_info = st.session_state.analyzer.get_table_info(
                        selected_table
                    )
                    if table_info is not None:
                        st.write("**Table Structure:**")
                        st.dataframe(_make_arrow_compatible(table_info))

                    # Row count
                    row_count = st.session_state.analyzer.get_row_count(selected_table)
                    if row_count is not None:
                        st.metric("Total Rows", row_count.iloc[0]["row_count"])

                with tab2:
                    st.subheader("Data Preview")

                    # Sample size selector
                    sample_size = st.slider(
                        "Number of rows to display",
                        min_value=10,
                        max_value=1000,
                        value=100,
                    )

                    # Get sample data
                    sample_data = st.session_state.analyzer.get_table_sample(
                        selected_table, sample_size
                    )
                    if sample_data is not None:
                        st.dataframe(_make_arrow_compatible(sample_data))

                        # Download option
                        csv = sample_data.to_csv(index=False)
                        st.download_button(
                            label="Download as CSV",
                            data=csv,
                            file_name=f"{selected_table}_sample.csv",
                            mime="text/csv",
                        )

                with tab3:
                    st.subheader("Statistics")

                    sample_data = st.session_state.analyzer.get_table_sample(
                        selected_table, 1000
                    )
                    if sample_data is not None:
                        # Basic statistics
                        st.write("**Basic Statistics:**")
                        st.dataframe(sample_data.describe())

                        # Missing values
                        st.write("**Missing Values:**")
                        missing_values = sample_data.isnull().sum()
                        missing_df = pd.DataFrame(
                            {
                                "Column": missing_values.index,
                                "Missing Count": missing_values.values,
                                "Missing Percentage": (
                                    missing_values.values / len(sample_data)
                                )
                                * 100,
                            }
                        )
                        st.dataframe(missing_df)

                with tab4:
                    st.subheader("Visualizations")

                    sample_data = st.session_state.analyzer.get_table_sample(
                        selected_table, 1000
                    )
                    if sample_data is not None:
                        # Column selector for visualization
                        numeric_columns = sample_data.select_dtypes(
                            include=["number"]
                        ).columns.tolist()
                        categorical_columns = sample_data.select_dtypes(
                            include=["object", "category"]
                        ).columns.tolist()

                        if numeric_columns:
                            st.write("**Numeric Column Analysis:**")
                            selected_numeric = st.selectbox(
                                "Select numeric column:", numeric_columns
                            )

                            if selected_numeric:
                                col1, col2 = st.columns(2)

                                with col1:
                                    # Histogram
                                    fig_hist = px.histogram(
                                        sample_data,
                                        x=selected_numeric,
                                        title=f"Distribution of {selected_numeric}",
                                    )
                                    st.plotly_chart(fig_hist, use_container_width=True)

                                with col2:
                                    # Box plot
                                    fig_box = px.box(
                                        sample_data,
                                        y=selected_numeric,
                                        title=f"Box Plot of {selected_numeric}",
                                    )
                                    st.plotly_chart(fig_box, use_container_width=True)

                        if categorical_columns:
                            st.write("**Categorical Column Analysis:**")
                            selected_categorical = st.selectbox(
                                "Select categorical column:", categorical_columns
                            )

                            if selected_categorical:
                                # Value counts
                                series_for_counts = (
                                    sample_data[selected_categorical]
                                    .dropna()
                                    .astype(str)
                                )
                                value_counts = series_for_counts.value_counts().head(10)
                                x_values = value_counts.index.tolist()
                                y_values = value_counts.values.tolist()
                                fig_bar = px.bar(
                                    x=x_values,
                                    y=y_values,
                                    title=f"Top 10 Values in {selected_categorical}",
                                    labels={"x": selected_categorical, "y": "Count"},
                                )
                                st.plotly_chart(fig_bar, use_container_width=True)

                        # Correlation matrix for numeric columns
                        if len(numeric_columns) > 1:
                            st.write("**Correlation Matrix:**")
                            corr_matrix = sample_data[numeric_columns].corr()
                            fig_corr = px.imshow(
                                corr_matrix, text_auto=True, title="Correlation Matrix"
                            )
                            st.plotly_chart(fig_corr, use_container_width=True)

        # Custom SQL query section
        st.header("Custom SQL Query")

        query = st.text_area("Enter your SQL query:", height=150)
        if st.button("Execute Query"):
            if query:
                result = st.session_state.analyzer.execute_query(query)
                if result is not None:
                    st.dataframe(_make_arrow_compatible(result))

                    # Download option
                    csv = result.to_csv(index=False)
                    st.download_button(
                        label="Download Results as CSV",
                        data=csv,
                        file_name="query_results.csv",
                        mime="text/csv",
                    )
            else:
                st.warning("Please enter a SQL query.")


if __name__ == "__main__":
    main()
