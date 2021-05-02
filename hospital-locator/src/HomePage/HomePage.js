import SearchBar from "../SearchBar/SearchBar";
import "./HomePage.css";
import "../SearchBar/SearchBar";
import { Header } from "../Header/Header";
import { HospitalList } from "../HospitalList/HospitalList";


function HomePage() {
  return (
    <div className="homepage-root">
      <Header /> 
      <SearchBar />
      <HospitalList />
    </div>
  );
}

export default HomePage;
