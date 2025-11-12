import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from sqlalchemy import create_engine, text
import os
import hmac
from dotenv import load_dotenv

load_dotenv()


class RetailyticsAnalyzer:
    def __init__(self):
        self.engine = None
        self.connection = None

    def connect(self):
        """Connect to PostgreSQL database"""
        try:
            db_config = {
                "host": os.getenv("DB_HOST"),
                "port": os.getenv("DB_PORT"),
                "database": os.getenv("DB_NAME"),
                "user": os.getenv("DB_USER"),
                "password": os.getenv("DB_PASSWORD"),
            }
            connection_string = f"postgresql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}?sslmode=require"
            self.engine = create_engine(connection_string, isolation_level="AUTOCOMMIT")
            self.connection = self.engine.connect()
            self.connection.execute(text("SET default_transaction_read_only = on"))
            return True
        except Exception as e:
            st.error(f"Database connection failed: {e}")
            return False

    def query(self, sql):
        """Execute query and return DataFrame"""
        try:
            return pd.read_sql_query(sql, self.connection)
        except Exception as e:
            st.error(f"Query failed: {e}")
            return None

    def get_total_stores(self):
        """Get total number of stores"""
        return self.query("SELECT COUNT(*) as count FROM stores")

    def get_stores_per_enumerator(self):
        """Get stores count per enumerator"""
        return self.query("""
            SELECT
                u.email as enumerator,
                COUNT(s.id) as store_count
            FROM users u
            LEFT JOIN stores s ON u.id = s.enumerator_id
            WHERE u.role = 'user'
            GROUP BY u.id, u.email
            ORDER BY store_count DESC
        """)

    def get_stores_per_district(self):
        """Get stores count per district"""
        return self.query("""
            SELECT
                COALESCE(d.name, 'Unassigned') as district,
                COUNT(s.id) as store_count
            FROM stores s
            LEFT JOIN districts d ON s.district_id = d.id
            GROUP BY d.id, d.name
            ORDER BY store_count DESC
        """)

    def get_stores_per_lga(self):
        """Get stores count per local government"""
        return self.query("""
            SELECT
                COALESCE(lg.name, 'Unassigned') as lga,
                COUNT(s.id) as store_count
            FROM stores s
            LEFT JOIN local_governments lg ON s.local_government_id = lg.id
            GROUP BY lg.id, lg.name
            ORDER BY store_count DESC
        """)

    def get_stores_per_state(self):
        """Get stores count per state"""
        return self.query("""
            SELECT
                COALESCE(st.name, 'Unassigned') as state,
                COUNT(s.id) as store_count
            FROM stores s
            LEFT JOIN states st ON s.state_id = st.id
            GROUP BY st.id, st.name
            ORDER BY store_count DESC
        """)

    def get_stores_by_type(self):
        """Get stores count by business type"""
        return self.query("""
            SELECT
                store_type as business_type,
                COUNT(*) as store_count
            FROM stores
            GROUP BY store_type
            ORDER BY store_count DESC
        """)

    def get_total_enumerators(self):
        """Get total assigned enumerators"""
        return self.query("""
            SELECT COUNT(*) as count
            FROM users
            WHERE role = 'user'
            AND (assigned_local_government_id IS NOT NULL
                 OR assigned_district_id IS NOT NULL
                 OR assigned_state_id IS NOT NULL)
        """)

    def get_enumerators_per_lga(self):
        """Get enumerators assigned per LGA"""
        return self.query("""
            SELECT
                COALESCE(lg.name, 'Unassigned') as lga,
                COUNT(u.id) as enumerator_count
            FROM users u
            LEFT JOIN local_governments lg ON u.assigned_local_government_id = lg.id
            WHERE u.role = 'user'
            GROUP BY lg.id, lg.name
            ORDER BY enumerator_count DESC
        """)

    def get_stores_with_location(self):
        """Get stores with coordinates for mapping"""
        return self.query("""
            SELECT
                s.name,
                s.address,
                s.store_type,
                s.latitude,
                s.longitude,
                u.email as enumerator,
                COALESCE(lg.name, 'N/A') as lga,
                COALESCE(d.name, 'N/A') as district
            FROM stores s
            LEFT JOIN users u ON s.enumerator_id = u.id
            LEFT JOIN local_governments lg ON s.local_government_id = lg.id
            LEFT JOIN districts d ON s.district_id = d.id
            LIMIT 1000
        """)

    def get_recent_stores(self, limit=10):
        """Get recently added stores"""
        return self.query(f"""
            SELECT
                s.name,
                s.address,
                s.store_type,
                s.created_at,
                u.email as enumerator
            FROM stores s
            LEFT JOIN users u ON s.enumerator_id = u.id
            ORDER BY s.created_at DESC
            LIMIT {limit}
        """)


def main():
    st.set_page_config(
        page_title="Retailytics Dashboard",
        page_icon="📊",
        layout="wide"
    )

    st.title("📊 Retailytics Analytics Dashboard")
    st.markdown("Real-time insights into retail store data collection")

    # Initialize analyzer
    if "analyzer" not in st.session_state:
        st.session_state.analyzer = RetailyticsAnalyzer()

    # Authentication
    if "authenticated" not in st.session_state:
        st.session_state.authenticated = False
    if "connected" not in st.session_state:
        st.session_state.connected = False

    if not st.session_state.authenticated:
        st.header("🔐 Admin Access")
        with st.form("admin_form"):
            admin_secret = st.text_input("Admin Secret", type="password")
            submit = st.form_submit_button("Unlock Dashboard")

        if submit:
            expected_secret = os.getenv("ADMIN_SECRET", "")
            if hmac.compare_digest(admin_secret or "", expected_secret):
                with st.spinner("Connecting to database..."):
                    if st.session_state.analyzer.connect():
                        st.success("✅ Connected successfully!")
                        st.session_state.authenticated = True
                        st.session_state.connected = True
                        st.rerun()
                    else:
                        st.error("❌ Database connection failed")
            else:
                st.error("❌ Invalid admin secret")
        st.stop()

    # Main dashboard
    if st.session_state.connected:

        # Refresh button
        if st.button("🔄 Refresh Data"):
            st.rerun()

        # === KEY METRICS ===
        st.header("📈 Key Metrics")

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            total_stores = st.session_state.analyzer.get_total_stores()
            if total_stores is not None:
                count = total_stores.iloc[0]["count"]
                st.metric("Total Stores", f"{count:,}")

        with col2:
            total_enum = st.session_state.analyzer.get_total_enumerators()
            if total_enum is not None:
                count = total_enum.iloc[0]["count"]
                st.metric("Assigned Enumerators", f"{count:,}")

        with col3:
            stores_per_enum = st.session_state.analyzer.get_stores_per_enumerator()
            if stores_per_enum is not None and len(stores_per_enum) > 0:
                avg_stores = stores_per_enum["store_count"].mean()
                st.metric("Avg Stores/Enumerator", f"{avg_stores:.1f}")

        with col4:
            lga_count = st.session_state.analyzer.get_stores_per_lga()
            if lga_count is not None:
                active_lgas = len(lga_count[lga_count["store_count"] > 0])
                st.metric("Active LGAs", f"{active_lgas}")

        st.divider()

        # === ENUMERATOR PERFORMANCE ===
        st.header("👥 Enumerator Performance")
        enum_data = st.session_state.analyzer.get_stores_per_enumerator()
        if enum_data is not None:
            col1, col2 = st.columns([3, 1])
            with col1:
                fig = px.bar(enum_data.head(15), x="enumerator", y="store_count",
                           title="Top 15 Enumerators", color="store_count")
                fig.update_layout(showlegend=False, xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)
            with col2:
                st.metric("Total", len(enum_data))
                st.metric("Active", len(enum_data[enum_data["store_count"] > 0]))
                csv = enum_data.to_csv(index=False)
                st.download_button("📥 CSV", csv, "enumerators.csv")

        st.divider()

        # === BUSINESS TYPES ===
        st.header("🏢 Business Types")
        business_data = st.session_state.analyzer.get_stores_by_type()
        if business_data is not None:
            col1, col2 = st.columns([2, 1])
            with col1:
                fig = px.pie(business_data, values="store_count", names="business_type",
                           title="Distribution", hole=0.4)
                st.plotly_chart(fig, use_container_width=True)
            with col2:
                st.dataframe(business_data, hide_index=True)
                csv = business_data.to_csv(index=False)
                st.download_button("📥 CSV", csv, "business_types.csv")

        st.divider()

        # === STORE DISTRIBUTION ===
        st.header("📍 Store Distribution")
        col1, col2 = st.columns(2)
        with col1:
            lga_data = st.session_state.analyzer.get_stores_per_lga()
            if lga_data is not None:
                fig = px.bar(lga_data.head(10), x="lga", y="store_count",
                           title="Top 10 LGAs", color="store_count")
                fig.update_layout(showlegend=False, xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)
        with col2:
            district_data = st.session_state.analyzer.get_stores_per_district()
            if district_data is not None:
                fig = px.bar(district_data.head(10), x="district", y="store_count",
                           title="Top 10 Districts", color="store_count")
                fig.update_layout(showlegend=False, xaxis_tickangle=-45)
                st.plotly_chart(fig, use_container_width=True)

        # === ENUMERATOR ASSIGNMENT ===
        enum_lga = st.session_state.analyzer.get_enumerators_per_lga()
        if enum_lga is not None:
            fig = px.pie(enum_lga[enum_lga["lga"] != "Unassigned"],
                        values="enumerator_count", names="lga",
                        title="Enumerators by LGA")
            st.plotly_chart(fig, use_container_width=True)

        st.divider()

        # === MAP ===
        st.header("🗺️ Store Locations")
        stores_location = st.session_state.analyzer.get_stores_with_location()
        if stores_location is not None and len(stores_location) > 0:
            stores_location["latitude"] = pd.to_numeric(stores_location["latitude"], errors="coerce")
            stores_location["longitude"] = pd.to_numeric(stores_location["longitude"], errors="coerce")
            valid = stores_location.dropna(subset=["latitude", "longitude"])
            if len(valid) > 0:
                fig = px.scatter_mapbox(valid, lat="latitude", lon="longitude",
                                       hover_name="name", color="store_type",
                                       hover_data=["address", "lga", "district"],
                                       zoom=10, height=500)
                fig.update_layout(mapbox_style="open-street-map")
                st.plotly_chart(fig, use_container_width=True)
                st.info(f"📍 {len(valid)} stores shown")

        st.divider()

        # === RECENT ACTIVITY ===
        st.header("🕐 Recent Activity")

        recent = st.session_state.analyzer.get_recent_stores(20)
        if recent is not None and len(recent) > 0:
            st.dataframe(
                recent,
                column_config={
                    "created_at": st.column_config.DatetimeColumn(
                        "Created At",
                        format="DD/MM/YYYY HH:mm"
                    ),
                    "name": "Store Name",
                    "address": "Address",
                    "store_type": "Business Type",
                    "enumerator": "Submitted By"
                },
                use_container_width=True,
                hide_index=True
            )


if __name__ == "__main__":
    main()
