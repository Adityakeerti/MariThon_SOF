#!/bin/bash
# Setup script for SOF Document Extractor
# Run with: chmod +x setup.sh && ./setup.sh

echo "🚀 Setting up SOF Document Extractor with Free APIs"
echo "=================================================="

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOL'
# Azure Document Intelligence (500 pages free/month for 12 months)
# Sign up at: https://portal.azure.com
AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT=
AZURE_DOCUMENT_INTELLIGENCE_KEY=

# Hugging Face (Completely free with rate limits) 
# Sign up at: https://huggingface.co/settings/tokens
HUGGINGFACE_TOKEN=

# Google Document AI ($300 free credit)
# Sign up at: https://cloud.google.com/document-ai
GOOGLE_PROJECT_ID=
GOOGLE_LOCATION=us
GOOGLE_PROCESSOR_ID=
GOOGLE_APPLICATION_CREDENTIALS=

# OpenRouter (Free tier available)
# Sign up at: https://openrouter.ai
OPENROUTER_API_KEY=

# OpenAI (Fallback)
OPENAI_API_KEY=
EOL
    echo "✅ Created .env file. Please fill in your API keys!"
else
    echo "✅ .env file already exists"
fi

# Make scripts executable
chmod +x test-client.py

echo ""
echo "🎉 Setup complete! Next steps:"
echo "==============================="
echo "1. Fill in your API keys in the .env file"
echo "2. Start the server: python sof-extractor-apis.py"
echo "3. Test with: python test-client.py your-sof-file.pdf"
echo ""
echo "📚 Free API Options (in order of recommendation):"
echo "1. Azure Document Intelligence: 500 pages/month free for 12 months"
echo "2. Hugging Face: Completely free with rate limits"
echo "3. Google Document AI: $300 free credit for new users"
echo "4. OpenRouter: Free tier with various LLM models"
echo ""
echo "🔧 To get API keys:"
echo "• Azure: https://portal.azure.com (Create Document Intelligence resource)"
echo "• Hugging Face: https://huggingface.co/settings/tokens" 
echo "• Google: https://cloud.google.com/document-ai"
echo "• OpenRouter: https://openrouter.ai"