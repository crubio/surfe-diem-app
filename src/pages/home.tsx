import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  try {
    const variation = getHomePageVariation();
    console.log('A/B test variation:', variation);
    
    // For now, just return DashboardHome regardless of variation
    // This tests if the A/B testing logic itself works
    return <DashboardHome />;
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;