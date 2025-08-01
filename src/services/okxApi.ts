// OKX API Service for legitimate trading operations
// This service provides methods to interact with OKX exchange API
// IMPORTANT: This is for educational purposes and legitimate trading only

interface OKXConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  sandbox?: boolean;
}

interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  price: string;
  volume24h: string;
}

interface OrderRequest {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  quantity: string;
  price?: string;
}

interface OrderResponse {
  orderId: string;
  symbol: string;
  side: string;
  type: string;
  quantity: string;
  price: string;
  status: string;
  timestamp: string;
}

class OKXApiService {
  private config: OKXConfig;
  private baseUrl: string;

  constructor(config: OKXConfig) {
    this.config = config;
    this.baseUrl = config.sandbox 
      ? 'https://www.okx.com/api/v5/sandbox'
      : 'https://www.okx.com/api/v5';
  }

  // Get account balance
  async getAccountBalance(): Promise<any> {
    try {
      const response = await this.makeRequest('GET', '/account/balance');
      return response.data;
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  // Get trading pairs
  async getTradingPairs(): Promise<TradingPair[]> {
    try {
      const response = await this.makeRequest('GET', '/market/tickers');
      return response.data.map((item: any) => ({
        symbol: item.instId,
        baseAsset: item.baseCcy,
        quoteAsset: item.quoteCcy,
        price: item.last,
        volume24h: item.vol24h
      }));
    } catch (error) {
      console.error('Error fetching trading pairs:', error);
      throw error;
    }
  }

  // Place a new order
  async placeOrder(orderRequest: OrderRequest): Promise<OrderResponse> {
    try {
      const payload = {
        instId: orderRequest.symbol,
        tdMode: 'cash',
        side: orderRequest.side,
        ordType: orderRequest.type,
        sz: orderRequest.quantity,
        ...(orderRequest.price && { px: orderRequest.price })
      };

      const response = await this.makeRequest('POST', '/trade/order', payload);
      
      return {
        orderId: response.data[0].ordId,
        symbol: response.data[0].instId,
        side: response.data[0].side,
        type: response.data[0].ordType,
        quantity: response.data[0].sz,
        price: response.data[0].px || '0',
        status: response.data[0].state,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Get order history
  async getOrderHistory(symbol?: string, limit: number = 50): Promise<OrderResponse[]> {
    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (symbol) {
        params.append('instId', symbol);
      }

      const response = await this.makeRequest('GET', `/trade/orders-history?${params}`);
      
      return response.data.map((item: any) => ({
        orderId: item.ordId,
        symbol: item.instId,
        side: item.side,
        type: item.ordType,
        quantity: item.sz,
        price: item.px,
        status: item.state,
        timestamp: item.cTime
      }));
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  // Get current positions
  async getPositions(): Promise<any[]> {
    try {
      const response = await this.makeRequest('GET', '/account/positions');
      return response.data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  // Private method to make authenticated requests
  private async makeRequest(method: string, endpoint: string, data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const timestamp = new Date().toISOString();
    
    // Create signature for authentication
    const signature = this.createSignature(method, endpoint, timestamp, data);
    
    const headers: Record<string, string> = {
      'OK-ACCESS-KEY': this.config.apiKey,
      'OK-ACCESS-SIGN': signature,
      'OK-ACCESS-TIMESTAMP': timestamp,
      'OK-ACCESS-PASSPHRASE': this.config.passphrase,
      'Content-Type': 'application/json'
    };

    if (this.config.sandbox) {
      headers['x-simulated-trading'] = '1';
    }

    const requestOptions: RequestInit = {
      method,
      headers,
      ...(data && { body: JSON.stringify(data) })
    };

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      throw new Error(`OKX API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Create signature for API authentication
  private createSignature(method: string, endpoint: string, timestamp: string, data?: any): string {
    // This is a simplified signature creation
    // In a real implementation, you would use HMAC-SHA256
    const message = timestamp + method + endpoint + (data ? JSON.stringify(data) : '');
    
    // For demo purposes, return a mock signature
    // In production, use proper HMAC-SHA256 signing
    return btoa(message + this.config.secretKey);
  }
}

// Export the service
export default OKXApiService;

// Example usage:
/*
const okxService = new OKXApiService({
  apiKey: 'your-api-key',
  secretKey: 'your-secret-key',
  passphrase: 'your-passphrase',
  sandbox: true // Use sandbox for testing
});

// Get account balance
const balance = await okxService.getAccountBalance();

// Get trading pairs
const pairs = await okxService.getTradingPairs();

// Place an order
const order = await okxService.placeOrder({
  symbol: 'BTC-USDT',
  side: 'buy',
  type: 'market',
  quantity: '0.001'
});
*/ 