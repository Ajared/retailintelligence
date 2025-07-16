import streamlit as st
import pandas as pd
import psycopg2
from sqlalchemy import create_engine
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import os
from dotenv import load_dotenv

load_dotenv()


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

    # Database connection section
    st.header("Database Connection")

    # Connection form
    with st.form("connection_form"):
        col1, col2 = st.columns(2)

        with col1:
            host = st.text_input("Host", value=os.getenv("DB_HOST", "localhost"))
            port = st.text_input("Port", value=os.getenv("DB_PORT", "5432"))
            database = st.text_input("Database", value=os.getenv("DB_NAME", ""))

        with col2:
            user = st.text_input("Username", value=os.getenv("DB_USER", ""))
            password = st.text_input(
                "Password", type="password", value=os.getenv("DB_PASSWORD", "")
            )

        connect_button = st.form_submit_button("Connect to Database")

        if connect_button:
            # Update environment variables
            os.environ["DB_HOST"] = host
            os.environ["DB_PORT"] = port
            os.environ["DB_NAME"] = database
            os.environ["DB_USER"] = user
            os.environ["DB_PASSWORD"] = password

            if st.session_state.analyzer.connect():
                st.success("Connected to database successfully!")
                st.session_state.connected = True
            else:
                st.session_state.connected = False

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
                        st.dataframe(table_info)

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
                        st.dataframe(sample_data)

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
                                value_counts = (
                                    sample_data[selected_categorical]
                                    .value_counts()
                                    .head(10)
                                )
                                fig_bar = px.bar(
                                    x=value_counts.index,
                                    y=value_counts.values,
                                    title=f"Top 10 Values in {selected_categorical}",
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
                    st.dataframe(result)

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
