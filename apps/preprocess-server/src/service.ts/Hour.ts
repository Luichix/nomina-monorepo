class HourRequest {
  private static readonly baseURL = '';

  static async getTimeRecords(): Promise<any> {
    try {
      const response = await fetch(this.baseURL);
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('An error occurred during the fetch request:', error);
      throw error;
    }
  }
}
