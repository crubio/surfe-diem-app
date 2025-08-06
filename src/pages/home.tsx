import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

// Working baseline from c7abab6 with A/B testing added
const Home = () => {
  try {
    const variation = getHomePageVariation();
    
    // For now, always return DashboardHome until other components are updated
    return <DashboardHome />;
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;