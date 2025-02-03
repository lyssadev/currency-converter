# 🌐 Currency Converter CLI Tool

A powerful and modern command-line currency converter tool that supports real-time exchange rates for 40+ currencies. Available in both Python and NodeJS implementations.

## ✨ Features

- 🔄 Real-time currency exchange rates using exchangerate-api.com
- 💱 Support for 40+ currencies including:
  - Major currencies (USD, EUR, GBP, JPY)
  - Latin American currencies (DOP, MXN, COP, CLP)
  - Asian currencies (CNY, JPY, KRW, SGD)
  - And many more!
- 🎨 Beautiful terminal output with colors and tables
- 📝 Conversion history tracking
- 🔍 Currency listing with detailed information
- 💾 Offline mode with cached exchange rates
- 🚀 Fast and responsive performance
- 🛠️ Easy-to-use CLI interface

## 🔧 Prerequisites

### For Python Version
- Python 3.8 or higher
- pip (Python package manager)
- Required packages:
  - requests
  - click
  - rich
  - python-dotenv

### For NodeJS Version
- Node.js 14 or higher
- npm (Node package manager)
- Required packages:
  - axios
  - commander
  - chalk
  - ora
  - table
  - dotenv

## 📦 Installation

1. Clone this repository:
```bash
git clone https://github.com/yourusername/currency-converter.git
cd currency-converter
```

2. Choose your preferred version and install dependencies:

### For Python:
```bash
# Install dependencies
pip install -r requirements.txt

# Make the script executable
chmod +x currency_converter.py
```

### For NodeJS:
```bash
# Install dependencies
npm install

# Make the script executable
chmod +x currency_converter.js
```

## 🚀 Usage

Both versions support the same commands and options:

### Basic Commands

1. Convert Currency:
```bash
# Python version
./currency_converter.py convert --amount 100 --from USD --to EUR

# Node.js version
./currency_converter.js convert --amount 100 --from USD --to EUR
```

2. List Available Currencies:
```bash
# Python version
./currency_converter.py list

# Node.js version
./currency_converter.js list
```

3. View Conversion History:
```bash
# Python version
./currency_converter.py history

# Node.js version
./currency_converter.js history
```

### Command Options

#### Convert Command
- `--amount`: Amount to convert (required)
- `--from`: Source currency code (required)
- `--to`: Target currency code (required)
- `--save`: Save conversion to history (optional)
- `--offline`: Use cached exchange rates (optional)

### Help Commands
```bash
# Get general help
./currency_converter.py --help
./currency_converter.js --help

# Get help for specific command
./currency_converter.py convert --help
./currency_converter.js convert --help
```

## 💰 Supported Currencies

The tool supports over 40 currencies, including:

| Code | Currency Name |
|------|--------------|
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| JPY | Japanese Yen |
| DOP | Dominican Peso |
| CNY | Chinese Yuan |
| INR | Indian Rupee |
| BRL | Brazilian Real |
| ... | And many more! |

Use the `list` command to see all supported currencies.

## 📝 Examples

1. Convert USD to EUR and save to history:
```bash
./currency_converter.py convert --amount 100 --from USD --to EUR --save
```

2. Convert DOP to USD using cached rates:
```bash
./currency_converter.js convert --amount 1000 --from DOP --to USD --offline
```

3. Convert multiple currencies:
```bash
# USD to EUR
./currency_converter.py convert --amount 50 --from USD --to EUR

# EUR to GBP
./currency_converter.py convert --amount 45 --from EUR --to GBP
```

4. View all supported currencies:
```bash
./currency_converter.py list
```

## 🔄 Cache and History

- Exchange rates are automatically cached for offline use
- Conversion history is stored locally in `conversion_history.json`
- Cache is stored in `rates_cache.json`

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/improvement`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add new feature'`)
5. Push to the branch (`git push origin feature/improvement`)
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Troubleshooting

### Common Issues

1. **Rate not available error:**
   - Check your internet connection
   - Verify the currency codes are correct
   - Try using the `--offline` mode if you've previously cached the rates

2. **Permission denied:**
   ```bash
   chmod +x currency_converter.py  # For Python version
   chmod +x currency_converter.js  # For Node.js version
   ```

3. **Module not found:**
   ```bash
   pip install -r requirements.txt  # For Python
   npm install                     # For Node.js
   ```

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section
2. Open an issue on GitHub
3. Submit a pull request with your fix