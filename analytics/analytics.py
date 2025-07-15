# Import necessary libraries for the Streamlit analytics dashboard
import streamlit as st  # Web app framework for creating interactive dashboards
import pandas as pd  # Data manipulation and analysis library
import psycopg2  # PostgreSQL database adapter for Python
from sqlalchemy import create_engine  # Database connection engine
import plotly.express as px  # High-level interface for creating interactive visualizations
import plotly.graph_objects as go  # Low-level interface for plotly charts
from plotly.subplots import make_subplots  # For creating subplots with multiple charts
import os  # Operating system interface for environment variables
from dotenv import load_dotenv  # Load environment variables from .env file

# Load environment variables from .env file for database configuration
load_dotenv()

# Main class for handling PostgreSQL database connections and queries
class PostgreSQLAnalyzer:
    def __init__(self):
        # Initialize database connection objects as None
        self.engine = None  # SQLAlchemy engine for database operations
        self.connection = None  # Active database connection
        
    def connect(self):
        """Connect to PostgreSQL database using environment variables"""
        try:
            # Build database configuration from environment variables with defaults
            db_config = {
                'host': os.getenv('DB_HOST', 'localhost'),  # Database host (default: localhost)
                'port': os.getenv('DB_PORT', '5432'),  # Database port (default: 5432)
                'database': os.getenv('DB_NAME'),  # Database name
                'user': os.getenv('DB_USER'),  # Database username
                'password': os.getenv('DB_PASSWORD')  # Database password
            }
            
            # Create PostgreSQL connection string in standard format
            connection_string = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}"
            # Create SQLAlchemy engine and establish connection
            self.engine = create_engine(connection_string)
            self.connection = self.engine.connect()
            return True  # Return success status
            
        except Exception as e:
            # Display error message in Streamlit interface
            st.error(f"Error connecting to database: {e}")
            return False  # Return failure status
    
    def execute_query(self, query):
        """Execute SQL query and return results as pandas DataFrame"""
        try:
            # Execute SQL query using pandas read_sql_query for automatic DataFrame conversion
            df = pd.read_sql_query(query, self.connection)
            return df  # Return DataFrame with query results
        except Exception as e:
            # Display error message in Streamlit interface
            st.error(f"Error executing query: {e}")
            return None  # Return None if query fails
    
    def get_tables(self):
        """Get list of all tables in the public schema of the database"""
        # SQL query to retrieve table names from PostgreSQL information schema
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'  -- Only get tables from public schema
        ORDER BY table_name;  -- Sort alphabetically
        """
        return self.execute_query(query)  # Execute query and return results
    
    def get_table_info(self, table_name):
        """Get column information (name, type, nullable) for a specific table"""
        # SQL query to get table structure from information schema
        query = f"""
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = '{table_name}'  -- Filter by specific table
        ORDER BY ordinal_position;  -- Order by column position in table
        """
        return self.execute_query(query)  # Execute query and return column info
    
    def get_table_sample(self, table_name, limit=100):
        """Get a sample of data from a table with specified row limit"""
        # Simple SELECT query with LIMIT to get sample data
        query = f"SELECT * FROM {table_name} LIMIT {limit};"
        return self.execute_query(query)  # Execute query and return sample data
    
    def get_row_count(self, table_name):
        """Get total number of rows in a specific table"""
        # COUNT query to get total rows in table
        query = f"SELECT COUNT(*) as row_count FROM {table_name};"
        return self.execute_query(query)  # Execute query and return row count
    
    def close_connection(self):
        """Safely close the database connection if it exists"""
        if self.connection:
            self.connection.close()  # Close the active database connection

# Main function that creates the Streamlit web application
def main():
    # Configure Streamlit page settings with wide layout for better data display
    st.set_page_config(page_title="PostgreSQL Data Analyzer", layout="wide")
    
    # Display main title and description of the application
    st.title("PostgreSQL Data Analyzer")
    st.markdown("Analyze your PostgreSQL database with interactive visualizations")
    
    # Initialize PostgreSQL analyzer in session state to persist across page reloads
    if 'analyzer' not in st.session_state:
        st.session_state.analyzer = PostgreSQLAnalyzer()
    
    # Database connection section - UI for entering database credentials
    st.header("Database Connection")
    
    # Create a form for database connection inputs to group them together
    with st.form("connection_form"):
        # Create two columns for organized input layout
        col1, col2 = st.columns(2)
        
        # Left column: connection details (host, port, database)
        with col1:
            host = st.text_input("Host", value=os.getenv('DB_HOST', 'localhost'))  # Database server host
            port = st.text_input("Port", value=os.getenv('DB_PORT', '5432'))  # Database port
            database = st.text_input("Database", value=os.getenv('DB_NAME', ''))  # Database name
        
        # Right column: authentication (username, password)
        with col2:
            user = st.text_input("Username", value=os.getenv('DB_USER', ''))  # Database username
            password = st.text_input("Password", type="password", value=os.getenv('DB_PASSWORD', ''))  # Database password (hidden)
        
        # Submit button for the connection form
        connect_button = st.form_submit_button("Connect to Database")
        
        # Handle connection form submission
        if connect_button:
            # Update environment variables with user-provided values
            os.environ['DB_HOST'] = host  # Set database host
            os.environ['DB_PORT'] = port  # Set database port
            os.environ['DB_NAME'] = database  # Set database name
            os.environ['DB_USER'] = user  # Set database username
            os.environ['DB_PASSWORD'] = password  # Set database password
            
            # Attempt to connect to database using updated credentials
            if st.session_state.analyzer.connect():
                st.success("Connected to database successfully!")  # Show success message
                st.session_state.connected = True  # Mark connection as successful
            else:
                st.session_state.connected = False  # Mark connection as failed
    
    # Main analysis section - only shown when database connection is successful
    if st.session_state.get('connected', False):
        st.header("Data Analysis")
        
        # Retrieve list of available tables from the connected database
        tables_df = st.session_state.analyzer.get_tables()
        if tables_df is not None and not tables_df.empty:
            # Convert DataFrame to list of table names for dropdown
            table_names = tables_df['table_name'].tolist()
            
            # Create dropdown for table selection
            selected_table = st.selectbox("Select a table to analyze:", table_names)
            
            # Show analysis tabs only when a table is selected
            if selected_table:
                # Create tabs for different types of data analysis
                tab1, tab2, tab3, tab4 = st.tabs(["Table Info", "Data Preview", "Statistics", "Visualizations"])
                
                # Tab 1: Table Information - shows structure and basic metadata
                with tab1:
                    st.subheader(f"Table Information: {selected_table}")
                    
                    # Display table structure (columns, data types, nullable status)
                    table_info = st.session_state.analyzer.get_table_info(selected_table)
                    if table_info is not None:
                        st.write("**Table Structure:**")
                        st.dataframe(table_info)  # Show column information in a table
                    
                    # Display total row count as a metric
                    row_count = st.session_state.analyzer.get_row_count(selected_table)
                    if row_count is not None:
                        st.metric("Total Rows", row_count.iloc[0]['row_count'])  # Extract count from DataFrame
                
                # Tab 2: Data Preview - shows sample data from the table
                with tab2:
                    st.subheader("Data Preview")
                    
                    # Allow user to control how many rows to display
                    sample_size = st.slider("Number of rows to display", min_value=10, max_value=1000, value=100)
                    
                    # Fetch and display sample data based on user selection
                    sample_data = st.session_state.analyzer.get_table_sample(selected_table, sample_size)
                    if sample_data is not None:
                        st.dataframe(sample_data)  # Display sample data in interactive table
                        
                        # Provide download option for the sample data
                        csv = sample_data.to_csv(index=False)  # Convert to CSV format
                        st.download_button(
                            label="Download as CSV",
                            data=csv,
                            file_name=f"{selected_table}_sample.csv",  # Dynamic filename
                            mime="text/csv"
                        )
                
                # Tab 3: Statistics - shows descriptive statistics and data quality metrics
                with tab3:
                    st.subheader("Statistics")
                    
                    # Get larger sample for better statistical analysis
                    sample_data = st.session_state.analyzer.get_table_sample(selected_table, 1000)
                    if sample_data is not None:
                        # Display basic descriptive statistics (mean, std, quartiles, etc.)
                        st.write("**Basic Statistics:**")
                        st.dataframe(sample_data.describe())  # Pandas describe() for numeric columns
                        
                        # Analyze missing values for data quality assessment
                        st.write("**Missing Values:**")
                        missing_values = sample_data.isnull().sum()  # Count null values per column
                        missing_df = pd.DataFrame({
                            'Column': missing_values.index,
                            'Missing Count': missing_values.values,
                            'Missing Percentage': (missing_values.values / len(sample_data)) * 100  # Calculate percentage
                        })
                        st.dataframe(missing_df)  # Display missing value analysis
                
                # Tab 4: Visualizations - creates interactive charts for data exploration
                with tab4:
                    st.subheader("Visualizations")
                    
                    # Get sample data for visualization (1000 rows for good performance)
                    sample_data = st.session_state.analyzer.get_table_sample(selected_table, 1000)
                    if sample_data is not None:
                        # Separate columns by data type for appropriate visualization
                        numeric_columns = sample_data.select_dtypes(include=['number']).columns.tolist()  # Numbers for histograms/box plots
                        categorical_columns = sample_data.select_dtypes(include=['object', 'category']).columns.tolist()  # Categories for bar charts
                        
                        # Numeric column visualizations - show distribution and outliers
                        if numeric_columns:
                            st.write("**Numeric Column Analysis:**")
                            selected_numeric = st.selectbox("Select numeric column:", numeric_columns)
                            
                            if selected_numeric:
                                col1, col2 = st.columns(2)  # Create side-by-side layout
                                
                                with col1:
                                    # Histogram to show data distribution
                                    fig_hist = px.histogram(sample_data, x=selected_numeric, title=f"Distribution of {selected_numeric}")
                                    st.plotly_chart(fig_hist, use_container_width=True)
                                
                                with col2:
                                    # Box plot to show quartiles and outliers
                                    fig_box = px.box(sample_data, y=selected_numeric, title=f"Box Plot of {selected_numeric}")
                                    st.plotly_chart(fig_box, use_container_width=True)
                        
                        # Categorical column visualizations - show frequency of values
                        if categorical_columns:
                            st.write("**Categorical Column Analysis:**")
                            selected_categorical = st.selectbox("Select categorical column:", categorical_columns)
                            
                            if selected_categorical:
                                # Count occurrences of each category value
                                value_counts = sample_data[selected_categorical].value_counts().head(10)  # Top 10 most frequent
                                # Create bar chart to show frequency distribution
                                fig_bar = px.bar(x=value_counts.index, y=value_counts.values, 
                                               title=f"Top 10 Values in {selected_categorical}")
                                st.plotly_chart(fig_bar, use_container_width=True)
                        
                        # Correlation analysis - show relationships between numeric columns
                        if len(numeric_columns) > 1:
                            st.write("**Correlation Matrix:**")
                            # Calculate correlation coefficients between all numeric columns
                            corr_matrix = sample_data[numeric_columns].corr()
                            # Create heatmap to visualize correlations (-1 to 1)
                            fig_corr = px.imshow(corr_matrix, text_auto=True, title="Correlation Matrix")
                            st.plotly_chart(fig_corr, use_container_width=True)
        
        # Custom SQL query section - allows advanced users to run custom queries
        st.header("Custom SQL Query")
        
        # Text area for SQL query input with reasonable height
        query = st.text_area("Enter your SQL query:", height=150)
        if st.button("Execute Query"):
            if query:
                # Execute the user-provided SQL query
                result = st.session_state.analyzer.execute_query(query)
                if result is not None:
                    st.dataframe(result)  # Display query results in interactive table
                    
                    # Provide download option for query results
                    csv = result.to_csv(index=False)  # Convert results to CSV
                    st.download_button(
                        label="Download Results as CSV",
                        data=csv,
                        file_name="query_results.csv",  # Fixed filename for query results
                        mime="text/csv"
                    )
            else:
                st.warning("Please enter a SQL query.")  # Show warning if no query entered

# Application entry point - run the main function when script is executed directly
if __name__ == "__main__":
    main()  # Start the Streamlit application