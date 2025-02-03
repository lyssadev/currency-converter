#!/usr/bin/env node

const { program } = require('commander');
const axios = require('axios');
const chalk = require('chalk');
const ora = require('ora');
const { table } = require('table');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const CACHE_FILE = 'rates_cache.json';
const HISTORY_FILE = 'conversion_history.json';
const API_BASE_URL = 'https://api.exchangerate-api.com/v4/latest';

const CURRENCY_CODES = {
    USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
    AUD: 'Australian Dollar', CAD: 'Canadian Dollar', CHF: 'Swiss Franc',
    CNY: 'Chinese Yuan', NZD: 'New Zealand Dollar', SEK: 'Swedish Krona',
    KRW: 'South Korean Won', SGD: 'Singapore Dollar', NOK: 'Norwegian Krone',
    MXN: 'Mexican Peso', INR: 'Indian Rupee', RUB: 'Russian Ruble',
    ZAR: 'South African Rand', TRY: 'Turkish Lira', BRL: 'Brazilian Real',
    TWD: 'Taiwan Dollar', DKK: 'Danish Krone', PLN: 'Polish Zloty',
    THB: 'Thai Baht', IDR: 'Indonesian Rupiah', HUF: 'Hungarian Forint',
    CZK: 'Czech Koruna', ILS: 'Israeli Shekel', CLP: 'Chilean Peso',
    PHP: 'Philippine Peso', AED: 'UAE Dirham', COP: 'Colombian Peso',
    SAR: 'Saudi Riyal', MYR: 'Malaysian Ringgit', RON: 'Romanian Leu',
    DOP: 'Dominican Peso', BGN: 'Bulgarian Lev', HKD: 'Hong Kong Dollar',
    HRK: 'Croatian Kuna', PKR: 'Pakistani Rupee', EGP: 'Egyptian Pound',
    ISK: 'Icelandic Króna', VND: 'Vietnamese Dong', NGN: 'Nigerian Naira'
};

class CurrencyConverter {
    constructor() {
        this.cacheFile = CACHE_FILE;
        this.historyFile = HISTORY_FILE;
    }

    async loadCache() {
        try {
            const data = await fs.readFile(this.cacheFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {};
        }
    }

    async saveCache(rates) {
        await fs.writeFile(this.cacheFile, JSON.stringify(rates, null, 2));
    }

    async saveToHistory(amount, fromCurrency, toCurrency, result) {
        try {
            let history = [];
            try {
                const data = await fs.readFile(this.historyFile, 'utf8');
                history = JSON.parse(data);
            } catch (error) {
                // File doesn't exist yet, start with empty history
            }

            history.push({
                timestamp: new Date().toISOString(),
                fromAmount: amount,
                fromCurrency,
                toCurrency,
                result
            });

            await fs.writeFile(this.historyFile, JSON.stringify(history, null, 2));
        } catch (error) {
            console.error(chalk.red('Error saving to history:', error.message));
        }
    }

    async showHistory() {
        try {
            const data = await fs.readFile(this.historyFile, 'utf8');
            const history = JSON.parse(data);

            const tableData = [
                ['Date', 'From', 'To', 'Result'].map(header => chalk.cyan(header))
            ];

            history.forEach(entry => {
                tableData.push([
                    new Date(entry.timestamp).toLocaleString(),
                    `${entry.fromAmount} ${entry.fromCurrency}`,
                    entry.toCurrency,
                    entry.result.toFixed(2)
                ]);
            });

            const config = {
                border: {
                    topBody: '─',
                    topJoin: '┬',
                    topLeft: '┌',
                    topRight: '┐',
                    bottomBody: '─',
                    bottomJoin: '┴',
                    bottomLeft: '└',
                    bottomRight: '┘',
                    bodyLeft: '│',
                    bodyRight: '│',
                    bodyJoin: '│',
                    joinBody: '─',
                    joinLeft: '├',
                    joinRight: '┤',
                    joinJoin: '┼'
                }
            };

            console.log(chalk.blue('\nConversion History'));
            console.log(table(tableData, config));
        } catch (error) {
            console.log(chalk.yellow('No conversion history found.'));
        }
    }

    listCurrencies() {
        const tableData = [
            ['Code', 'Currency Name'].map(header => chalk.cyan(header))
        ];

        Object.entries(CURRENCY_CODES)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([code, name]) => {
                tableData.push([chalk.green(code), name]);
            });

        const config = {
            border: {
                topBody: '─',
                topJoin: '┬',
                topLeft: '┌',
                topRight: '┐',
                bottomBody: '─',
                bottomJoin: '┴',
                bottomLeft: '└',
                bottomRight: '┘',
                bodyLeft: '│',
                bodyRight: '│',
                bodyJoin: '│',
                joinBody: '─',
                joinLeft: '├',
                joinRight: '┤',
                joinJoin: '┼'
            }
        };

        console.log(chalk.blue('\nAvailable Currencies'));
        console.log(table(tableData, config));
    }

    async convert(amount, fromCurrency, toCurrency, offline = false) {
        const spinner = ora('Converting currency...').start();

        try {
            let rate;
            if (offline) {
                const cache = await this.loadCache();
                const cacheKey = `${fromCurrency}_${toCurrency}`;
                rate = cache[cacheKey];

                if (!rate) {
                    spinner.fail();
                    console.error(chalk.red('No cached rate available. Please run in online mode first.'));
                    process.exit(1);
                }
            } else {
                const response = await axios.get(`${API_BASE_URL}/${fromCurrency}`);
                const rates = response.data.rates;
                rate = rates[toCurrency];

                if (!rate) {
                    spinner.fail();
                    console.error(chalk.red(`Rate not available for ${fromCurrency} to ${toCurrency}`));
                    process.exit(1);
                }

                // Cache the rate
                const cache = await this.loadCache();
                cache[`${fromCurrency}_${toCurrency}`] = rate;
                await this.saveCache(cache);
            }

            const result = amount * rate;
            spinner.succeed();
            return result;
        } catch (error) {
            spinner.fail();
            console.error(chalk.red('Error:', error.message));
            process.exit(1);
        }
    }
}

function displayResult(amount, fromCurrency, toCurrency, result) {
    const data = [
        [
            chalk.green(amount.toFixed(2)),
            chalk.yellow(fromCurrency),
            '→',
            chalk.green(result.toFixed(2)),
            chalk.yellow(toCurrency)
        ]
    ];

    const config = {
        border: {
            topBody: '─',
            topJoin: '┬',
            topLeft: '┌',
            topRight: '┐',
            bottomBody: '─',
            bottomJoin: '┴',
            bottomLeft: '└',
            bottomRight: '┘',
            bodyLeft: '│',
            bodyRight: '│',
            bodyJoin: '│',
            joinBody: '─',
            joinLeft: '├',
            joinRight: '┤',
            joinJoin: '┼'
        }
    };

    console.log(chalk.blue('\nCurrency Conversion Result'));
    console.log(table(data, config));
}

program
    .version('1.0.0')
    .description('Modern Currency Converter CLI Tool');

program
    .command('convert')
    .description('Convert currency from one to another')
    .requiredOption('--amount <number>', 'Amount to convert')
    .requiredOption('--from <currency>', 'Source currency code')
    .requiredOption('--to <currency>', 'Target currency code')
    .option('--save', 'Save conversion to history')
    .option('--offline', 'Use cached exchange rates')
    .action(async (options) => {
        const converter = new CurrencyConverter();
        const amount = parseFloat(options.amount);
        const fromCurrency = options.from.toUpperCase();
        const toCurrency = options.to.toUpperCase();

        // Validate currencies
        if (!CURRENCY_CODES[fromCurrency]) {
            console.error(chalk.red(`Error: Currency ${fromCurrency} is not supported`));
            process.exit(1);
        }
        if (!CURRENCY_CODES[toCurrency]) {
            console.error(chalk.red(`Error: Currency ${toCurrency} is not supported`));
            process.exit(1);
        }

        try {
            const result = await converter.convert(amount, fromCurrency, toCurrency, options.offline);
            displayResult(amount, fromCurrency, toCurrency, result);

            if (options.save) {
                await converter.saveToHistory(amount, fromCurrency, toCurrency, result);
                console.log(chalk.green('\nConversion saved to history.'));
            }
        } catch (error) {
            console.error(chalk.red('Error:', error.message));
            process.exit(1);
        }
    });

program
    .command('list')
    .description('List all available currencies')
    .action(() => {
        const converter = new CurrencyConverter();
        converter.listCurrencies();
    });

program
    .command('history')
    .description('Show conversion history')
    .action(async () => {
        const converter = new CurrencyConverter();
        await converter.showHistory();
    });

program.parse(process.argv); 