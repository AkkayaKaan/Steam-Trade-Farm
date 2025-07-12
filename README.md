# Steam Trade Farm Bot

A lightweight Node.js bot designed to automate trading of TF2 cases between two Steam accounts to maximize the total number of completed trades. It ensures reliable trade execution with robust error handling and Steam Guard mobile confirmations.

## Purpose

The bot continuously trades TF2 cases between two Steam accounts to increase the total trade count, tracked persistently in a JSON file.

## Features

- **Automated Trading Loop**: Continuously trades cases between two accounts.
- **Steam Guard Support**: Handles mobile confirmations for secure trades.
- **Error Handling**: Retries failed operations to manage Steam rate limits and errors.
- **Trade Counter**: Tracks and saves the total number of trades.

## Prerequisites

- **Node.js** (v14 or higher)
- **Steam Accounts**: Two accounts with valid credentials, trade URLs, and Steam Guard enabled.
- **TF2 Items**: Tradable cases inventory.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AkkayaKaan/steam-trade-farm-bot.git
   cd steam-trade-farm-bot
   ```
2. Install dependencies using the provided script:
   - On Windows, run:

     ```bash
     install.bat
     ```

     This installs required modules (`steam-user`, `steamcommunity`, `steam-tradeoffer-manager`, `steam-totp`, `chalk`).
   - Or manually:

     ```bash
     npm install steam-user steamcommunity steam-tradeoffer-manager steam-totp chalk
     ```
3. Configure `config.json` with your Steam account details:

   ```json
   {
     "accounts": [
       {
         "username": "your_username_1",
         "password": "your_password_1",
         "shared_secret": "your_shared_secret_1",
         "identity_secret": "your_identity_secret_1",
         "trade_url": "your_trade_url_1"
       },
       {
         "username": "your_username_2",
         "password": "your_password_2",
         "shared_secret": "your_shared_secret_2",
         "identity_secret": "your_identity_secret_2",
         "trade_url": "your_trade_url_2"
       }
     ]
   }
   ```

## Usage

1. Ensure `config.json` is set up with valid Steam account details.
2. Start the bot:
   - On Windows, run:

     ```bash
     start.bat
     ```

     This executes `node index.js`.
   - Or manually:

     ```bash
     node index.js
     ```
3. The bot logs in both accounts, trades cases, confirms via Steam Guard, and tracks trade counts.

## Project Structure

- `index.js`: Core script for login, trading, and loop logic.
- `trade.js`: Manages sending trade offers.
- `guard.js`: Handles mobile confirmations with retries.
- `counter.js`: Tracks and saves trade counts.
- `log.js`: Provides timestamped console logging.
- `config.json`: Stores Steam account credentials and trade URLs.
- `trade_count.json`: Persists total trade count (auto-generated).
- `install.bat`: Installs required Node.js modules (Windows).
- `start.bat`: Starts the bot with `node index.js` (Windows).

## Notes

- Both accounts must have tradable TF2 cases.
- The bot retries failed inventory fetches and trade sends to handle Steam errors.
- Use valid Steam Guard secrets to prevent authentication issues.
- Trade counts are saved in `trade_count.json` and logged after each trade.

## Contributing

Submit issues or pull requests via GitHub.

## License

MIT License. See LICENSE for details.

## Author

Kaan Akkaya (github.com/AkkayaKaan)