import DashboardHome from "./dashboard-home";

// Working baseline from c7abab6 with A/B testing added
const Home = () => {
  try {
    // For now, always return DashboardHome until other components are updated
    return <DashboardHome />;
  } catch (error) {
    console.warn('Error in Home component, falling back to dashboard:', error);
    return <DashboardHome />;
  }
};

export default Home;