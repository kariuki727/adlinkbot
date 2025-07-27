from config import *
import aiomysql
import helpers

class Database:
    def __init__(self, uri, database_name):
        # Parse the database URL using urlparse
        from urllib.parse import urlparse
        
        # Parse the database URL (e.g. mysql://user:password@host:port/dbname)
        parsed_url = urlparse(uri)
        self._user = parsed_url.username
        self._password = parsed_url.password
        self._host = parsed_url.hostname
        self._port = parsed_url.port or 3306  # Default to 3306 if no port specified
        self._dbname = database_name

    async def connect(self):
        # Establish a connection pool for MySQL using aiomysql
        self.pool = await aiomysql.create_pool(
            host=self._host,
            port=self._port,
            user=self._user,
            password=self._password,
            db=self._dbname,
            autocommit=True
        )
        print(f"Connected to MySQL database {self._dbname} at {self._host}")

    async def close(self):
        # Close the pool when done
        self.pool.close()
        await self.pool.wait_closed()
        print("MySQL connection closed")

    async def get_db_size(self):
        # MySQL doesn't have a direct equivalent of dbstats, 
        # so we can calculate the database size by querying the information schema
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT table_schema AS db_name, SUM(data_length + index_length) AS db_size FROM information_schema.tables WHERE table_schema = %s GROUP BY table_schema;", (self._dbname,))
                result = await cursor.fetchone()
                return result[1] if result else 0

    async def get_bot_stats(self):
        # Fetch bot stats from the database (SQL query)
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT * FROM stats WHERE bot = %s;", (helpers.temp.BOT_USERNAME,))
                result = await cursor.fetchone()
                return result

    async def create_stats(self):
        # Insert initial stats for the bot
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "INSERT INTO stats (bot, posts, links, snipn_links, shortener_links) VALUES (%s, %s, %s, %s, %s);",
                    (helpers.temp.BOT_USERNAME, 0, 0, 0, 0)
                )

    async def update_posts(self, posts: int):
        # Update posts count in the stats table
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    "UPDATE stats SET posts = posts + %s WHERE bot = %s;", (posts, helpers.temp.BOT_USERNAME)
                )

    async def update_links(self, links: int, droplink: int = 0, snipn: int = 0):
        # Update link counts (links, snipn_links, shortener_links) in the stats table
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(
                    """
                    UPDATE stats 
                    SET links = links + %s, snipn_links = snipn_links + %s, shortener_links = shortener_links + %s
                    WHERE bot = %s;
                    """, 
                    (links, snipn, droplink, helpers.temp.BOT_USERNAME)
                )


# Usage: Set the DATABASE_URL and DATABASE_NAME via environment variables
DATABASE_URL = os.getenv("DATABASE_URL")  # e.g., mysql://user:password@localhost:3306/mydatabase
DATABASE_NAME = os.getenv("DATABASE_NAME")

db = Database(DATABASE_URL, DATABASE_NAME)
