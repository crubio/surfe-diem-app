import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  try {
    // Test with a hardcoded variation instead of calling getHomePageVariation()
    const variation = 'dashboard';
    console.log('A/B test variation:', variation);
    
    // For now, just return DashboardHome regardless of variation
    // This tests if the issue is with the getHomePageVariation() function
    return <DashboardHome />;
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;