import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './App.css';

function App() {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState(null);
  const [coinData, setCoinData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('all'); // 'all', '12h', '6h', '3h'

  // Fetch available coins on component mount
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('https://oxfun-data-server-production.up.railway.app/api/coins');
        const options = response.data.symbols.map(symbol => ({
          value: symbol,
          label: symbol
        }));
        
        // Set BTC as default if available
        const btcOption = options.find(option => option.value === 'BTC-USD-SWAP-LIN');
        if (btcOption) {
          setSelectedCoin(btcOption);
        }
        
        setCoins(options);
      } catch (err) {
        setError('Failed to fetch coin options. Please try again later.');
        console.error('Error fetching coins:', err);
      }
    };

    fetchCoins();
  }, []);

  // Fetch coin data when a coin is selected
  useEffect(() => {
    if (!selectedCoin) return;

    const fetchCoinData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`https://oxfun-data-server-production.up.railway.app/api/coins/${selectedCoin.value}`);
        setCoinData(response.data);
      } catch (err) {
        setError(`Failed to fetch data for ${selectedCoin.label}. Please try again later.`);
        console.error('Error fetching coin data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, [selectedCoin]);

  // Filter data based on selected timeframe
  const getFilteredData = (data) => {
    if (!data || !data.data) return [];
    
    if (timeframe === 'all') return data.data;
    
    const now = new Date();
    const hoursToSubtract = timeframe === '12h' ? 12 : timeframe === '6h' ? 6 : 3;
    const cutoffTime = new Date(now.getTime() - hoursToSubtract * 60 * 60 * 1000);
    
    return data.data.filter(item => new Date(item.timestamp) >= cutoffTime);
  };

  // Format data for the chart
  const formatChartData = (data) => {
    if (!data || !data.data) return [];
    
    const filteredData = getFilteredData(data);
    
    return filteredData.map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: item.value,
      fullTimestamp: item.timestamp,
      date: new Date(item.timestamp).toLocaleDateString()
    }));
  };

  // Format the tooltip value
  const formatTooltipValue = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  // Calculate percentage change
  const calculateChange = () => {
    if (!coinData || !coinData.data || coinData.data.length < 2) return { value: 0, isPositive: true };
    
    const filteredData = getFilteredData(coinData);
    if (filteredData.length < 2) return { value: 0, isPositive: true };
    
    const firstValue = filteredData[0].value;
    const lastValue = filteredData[filteredData.length - 1].value;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
      value: Math.abs(change).toFixed(2),
      isPositive: change >= 0
    };
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip">
          <p className="tooltip-time">{new Date(data.fullTimestamp).toLocaleString()}</p>
          <p className="tooltip-value">Open Interest: {formatTooltipValue(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  // Timeframe button component
  const TimeframeButton = ({ value, label, currentTimeframe, onClick }) => (
    <button 
      className={`timeframe-btn ${timeframe === value ? 'active' : ''}`}
      onClick={() => onClick(value)}
    >
      {label}
    </button>
  );

  const change = calculateChange();

  return (
    <div className="App">
      <header className="App-header">
        <h1>OX.FUN OI</h1>
        <div className="search-container">
          <Select
            className="coin-select"
            options={coins}
            value={selectedCoin}
            onChange={setSelectedCoin}
            placeholder="Search for a coin..."
            isSearchable
            isClearable
          />
        </div>
      </header>

      <main className="App-main">
        {error && <div className="error-message">{error}</div>}
        
        {loading && <div className="loading">Loading data...</div>}
        
        {!loading && selectedCoin && coinData && (
          <div className="chart-container">
            <div className="chart-header">
              <h2>
                <span className="coin-symbol">{selectedCoin.label}</span>
                <span className={`change-indicator ${change.isPositive ? 'positive' : 'negative'}`}>
                  {change.isPositive ? '↑' : '↓'} {change.value}%
                </span>
              </h2>
              <div className="timeframe-controls">
                <TimeframeButton value="3h" label="3H" currentTimeframe={timeframe} onClick={setTimeframe} />
                <TimeframeButton value="6h" label="6H" currentTimeframe={timeframe} onClick={setTimeframe} />
                <TimeframeButton value="12h" label="12H" currentTimeframe={timeframe} onClick={setTimeframe} />
                <TimeframeButton value="all" label="ALL" currentTimeframe={timeframe} onClick={setTimeframe} />
              </div>
            </div>
            
            <div className="chart-stats">
              <div className="stat-item">
                <span className="stat-label">Latest OI</span>
                <span className="stat-value">
                  {coinData.data.length > 0 ? formatTooltipValue(coinData.data[coinData.data.length - 1].value) : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">24h Change</span>
                <span className={`stat-value ${change.isPositive ? 'positive' : 'negative'}`}>
                  {change.isPositive ? '+' : '-'}{change.value}%
                </span>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart
                data={formatChartData(coinData)}
                margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis 
                  tickFormatter={(value) => value.toLocaleString('en-US', { notation: 'compact', compactDisplay: 'short' })}
                  width={70}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00c087" 
                  fill="#00c087" 
                  fillOpacity={0.2} 
                  activeDot={{ r: 6, stroke: '#00c087', strokeWidth: 2, fill: '#121212' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {!selectedCoin && (
          <div className="instructions">
            <h2>OX.FUN Open Interest Tracker</h2>
            <p>Select a coin from the dropdown above to view its hourly open interest data.</p>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Data provided by OX.FUN Data Server</p>
      </footer>
    </div>
  );
}

export default App;
