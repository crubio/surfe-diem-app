import { getHomePageVariation } from "utils/ab-testing";
import CurrentHome from "./current-home";
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import MinimalistHome from "./minimalist-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  const variation = getHomePageVariation();
  
  // Render the appropriate home page variation
  switch (variation) {
    case 'dashboard':
      return <DashboardHome />;
    case 'discovery':
      return <DiscoveryHome />;
    case 'minimalist':
      return <MinimalistHome />;
    case 'data-rich':
      return <DataRichHome />;
    case 'current':
    default:
      return <CurrentHome />;
  }
};

export default Home;