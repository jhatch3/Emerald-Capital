#!/usr/bin/env python3
"""
Quick test script for the Agent Decision API endpoint
"""
import requests
import json
import sys

def test_decision_api():
    """Test the /api/agents/decision endpoint"""
    
    url = "http://localhost:8000/api/agents/decision"
    
    # Test data
    test_data = {
        "market": {
            "symbol": "SOL",
            "price": 98.45,
            "volume24h": 1500000,
            "marketCap": 45000000
        },
        "data": {
            "portfolio": {
                "totalValue": 100000,
                "heat": 42,
                "positions": [
                    {
                        "symbol": "SOL",
                        "size": 50000,
                        "pnl": 2.5
                    }
                ]
            },
            "historicalData": [
                {
                    "date": "2024-02-19",
                    "price": 97.20,
                    "volume": 1200000
                }
            ],
            "sentiment": {
                "socialScore": 75,
                "newsScore": 68,
                "trend": "bullish"
            }
        }
    }
    
    print("🧪 Testing Agent Decision API")
    print("=" * 50)
    print(f"\n📤 Sending request to: {url}")
    print(f"📊 Market: {test_data['market']['symbol']} @ ${test_data['market']['price']}")
    print("\n⏳ Waiting for response (this may take 20-50 seconds)...\n")
    
    try:
        response = requests.post(url, json=test_data, timeout=120)
        
        print(f"📥 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            print("\n✅ SUCCESS!")
            print("\n" + "=" * 50)
            print("📋 Response Summary:")
            print("=" * 50)
            
            if result.get("status") == "ok":
                decision = result.get("decision", {})
                agents = result.get("agents", [])
                
                print(f"\n🎯 Consensus Decision:")
                print(f"   Direction: {decision.get('direction', 'N/A')}")
                print(f"   Size: ${decision.get('size', 0):,.2f}")
                print(f"   Reasoning: {decision.get('reasoning', 'N/A')[:100]}...")
                
                print(f"\n🤖 Agent Decisions ({len(agents)} agents):")
                for agent in agents:
                    agent_name = agent.get("agent", "Unknown")
                    agent_decision = agent.get("decision", {})
                    print(f"   {agent_name}:")
                    print(f"      Direction: {agent_decision.get('direction', 'N/A')}")
                    print(f"      Confidence: {agent_decision.get('confidence', 0)}%")
                    print(f"      Size: ${agent_decision.get('size', 0):,.2f}")
                
                print("\n" + "=" * 50)
                print("✅ All tests passed!")
                return True
            else:
                print(f"\n❌ Error: {result.get('error', 'Unknown error')}")
                return False
        else:
            print(f"\n❌ Request failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Is the Python backend running?")
        print("   Start it with: uvicorn app.main:app --reload --port 8000")
        return False
    except requests.exceptions.Timeout:
        print("\n❌ Request timed out (took longer than 120 seconds)")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_decision_api()
    sys.exit(0 if success else 1)

