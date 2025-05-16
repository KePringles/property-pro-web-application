import psycopg2

# Update these values with your database config
DB_NAME = "property_pro_dev"
DB_USER = "postgres"
DB_PASSWORD = "Khayondra@1"
DB_HOST = "localhost"
DB_PORT = "5432"

def execute_sql_file(cursor, file_path):
    with open(file_path, 'r') as f:
        sql = f.read()
        cursor.execute(sql)
        print(f"✅ Executed: {file_path}")

def main():
    try:
        # Connect to the PostgreSQL database
        conn = psycopg2.connect(
            dbname=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            host=DB_HOST,
            port=DB_PORT
        )
        conn.autocommit = True
        cursor = conn.cursor()

        # Only run schema setup
        execute_sql_file(cursor, 'app/db/schema.sql')

        cursor.close()
        conn.close()
        print("🎉 Database schema initialized successfully.")

    except Exception as e:
        print("❌ Error initializing database schema:", e)

if __name__ == "__main__":
    main()