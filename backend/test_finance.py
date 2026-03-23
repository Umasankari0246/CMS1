import asyncio
from db import get_db
from datetime import datetime

async def test_finance_data():
    try:
        db = get_db()
        
        # Check if fees_structure collection exists and has data
        collections = await db.list_collection_names()
        print(f"Available collections: {collections}")
        
        if "fees_structure" in collections:
            count = await db["fees_structure"].count_documents({})
            print(f"fees_structure collection has {count} documents")
            
            # Get a sample document
            sample = await db["fees_structure"].find_one()
            print(f"Sample document: {sample}")
            
            # Get all documents
            docs = []
            async for doc in db["fees_structure"].find().limit(5):
                docs.append(doc)
            print(f"First 5 documents: {docs}")
        else:
            print("fees_structure collection does not exist")
            
            # Create sample data
            sample_fees = [
                {
                    "student_id": "STU001",
                    "student_name": "John Doe",
                    "course": "Computer Science",
                    "semester": 1,
                    "first_graduate": False,
                    "hostel_required": True,
                    "fee_breakdown": {
                        "tuition": 50000,
                        "hostel": 20000,
                        "library": 5000,
                        "lab": 3000,
                        "other": 2000
                    },
                    "total_fee": 80000,
                    "assigned_date": datetime(2026, 1, 15),
                    "payment_status": "Paid"
                },
                {
                    "student_id": "STU002", 
                    "student_name": "Jane Smith",
                    "course": "Mechanical",
                    "semester": 2,
                    "first_graduate": True,
                    "hostel_required": False,
                    "fee_breakdown": {
                        "tuition": 45000,
                        "hostel": 0,
                        "library": 4000,
                        "lab": 2500,
                        "other": 1500
                    },
                    "total_fee": 53000,
                    "assigned_date": datetime(2026, 2, 20),
                    "payment_status": "Pending"
                },
                {
                    "student_id": "STU003",
                    "student_name": "Bob Johnson", 
                    "course": "Electrical",
                    "semester": 3,
                    "first_graduate": False,
                    "hostel_required": True,
                    "fee_breakdown": {
                        "tuition": 48000,
                        "hostel": 18000,
                        "library": 4500,
                        "lab": 2800,
                        "other": 1700
                    },
                    "total_fee": 75000,
                    "assigned_date": datetime(2026, 3, 10),
                    "payment_status": "Paid"
                }
            ]
            
            # Insert sample data
            result = await db["fees_structure"].insert_many(sample_fees)
            print(f"Inserted {len(result.inserted_ids)} sample fee records")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_finance_data())
