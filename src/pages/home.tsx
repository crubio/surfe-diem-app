import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

// Working baseline from c7abab6 with A/B testing added
const Home = () => {
  try {
    const variation = getHomePageVariation();
    
    switch (variation) {
      case 'dashboard':
        return <DashboardHome />;
      case 'discovery':
        return <DashboardHome />; // Temporarily use DashboardHome instead of DiscoveryHome
      case 'data-rich':
        return <DataRichHome />;
      default:
        return <DashboardHome />;
    }
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;