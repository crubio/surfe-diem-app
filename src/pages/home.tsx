import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  try {
    const variation = getHomePageVariation();
    
    switch (variation) {
      case 'dashboard':
        return <DashboardHome />;
      case 'discovery':
        return <DiscoveryHome />;
      case 'data-rich':
        return <DataRichHome />;
      default: // Fallback to dashboard if no valid variation is assigned
        return <DashboardHome />;
    }
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;