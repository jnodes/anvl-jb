from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'anvl_db')]

# Collections
dealers_collection = db.dealers
loans_collection = db.loans
vehicles_collection = db.vehicles
audits_collection = db.audits
transactions_collection = db.transactions
notifications_collection = db.notifications

async def get_database():
    return db

# Helper functions for database operations
async def create_indexes():
    """Create database indexes for better performance"""
    try:
        # Dealers indexes
        await dealers_collection.create_index("wallet_address", unique=True)
        await dealers_collection.create_index("email", unique=True)
        
        # Loans indexes
        await loans_collection.create_index("dealer_id")
        await loans_collection.create_index("status")
        
        # Vehicles indexes
        await vehicles_collection.create_index("dealer_id")
        await vehicles_collection.create_index("vin", unique=True)
        await vehicles_collection.create_index("loan_id")
        await vehicles_collection.create_index("status")
        
        # Audits indexes
        await audits_collection.create_index("dealer_id")
        await audits_collection.create_index("vehicle_id")
        await audits_collection.create_index("timestamp")
        
        # Transactions indexes
        await transactions_collection.create_index("dealer_id")
        await transactions_collection.create_index("loan_id")
        await transactions_collection.create_index("timestamp")
        
        # Notifications indexes
        await notifications_collection.create_index("dealer_id")
        await notifications_collection.create_index("timestamp")
        
        print("Database indexes created successfully")
    except Exception as e:
        print(f"Error creating indexes: {e}")

# Utility functions
def convert_objectid_to_str(document):
    """Convert MongoDB ObjectId to string for JSON serialization"""
    if document and "_id" in document:
        document["_id"] = str(document["_id"])
    return document

async def find_one_and_convert(collection, filter_dict):
    """Find one document and convert ObjectId to string"""
    document = await collection.find_one(filter_dict)
    return convert_objectid_to_str(document) if document else None

async def find_many_and_convert(collection, filter_dict, limit=None, sort=None):
    """Find multiple documents and convert ObjectId to string"""
    cursor = collection.find(filter_dict)
    
    if sort:
        cursor = cursor.sort(sort)
    if limit:
        cursor = cursor.limit(limit)
    
    documents = await cursor.to_list(length=limit)
    return [convert_objectid_to_str(doc) for doc in documents]