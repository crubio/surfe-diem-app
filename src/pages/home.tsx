import { getHomePageVariation } from 'utils/ab-testing';
import DashboardHome from "./dashboard-home";
import DiscoveryHome from "./discovery-home";
import DataRichHome from "./data-rich-home";

const Home = () => {
  console.log('Home component starting...');
  return <DashboardHome />;
};

export default Home;