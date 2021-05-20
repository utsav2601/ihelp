import { useState } from "react";
// import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
// import { Helmet } from "react-helmet";
// import HomePage from "../HomePage/HomePage";
// import HospitalFullInfo from "../HospitalFullInfo/HospitalFullInfo";
// import "./App.css";
// import { Header } from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import { CssBaseline, Paper } from "@material-ui/core";
import { ThemeProvider} from '@material-ui/core/styles';
import { theme } from "../mui_theme";
import Search from "../Search/Search";
import SearchList from "../Search/SearchList";
// import Amplify, { API, graphqlOperation } from "aws-amplify";
// import awsconfig from "./aws-exports";

// Amplify.configure(awsconfig);

function App() {

  // const [theme, setTheme] = useState(false);

  // const handleClick = () => {
  //     setTheme(!theme);
  //     console.log(theme);
  // }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Paper>
          <Navbar title="iHelp"/>
          <Search />
          <SearchList />
      </Paper>
    </ThemeProvider>
  );
}

export default App;



// const [chosenUserCity, updateChosenUserCity] = useState(undefined);
// const [gpsUserLocation, updateGPSUserLocation] = useState(undefined);
// const [userLang, updateUserLang] = useState("hi");

// <Router>  
//         <div>
//         {/* Set html head attributes, including lang which should be able to change for users */}
//         <Helmet htmlAttributes>
//           <html lang="hi" />
//             <meta charSet="utf-8" />
//             <title>Covid Resources: Find the Nearest Hospital, Fast</title>
//             <link rel="canonical" href="http://ihelp.app" />
//           </Helmet>
//         <Navbar/>
//         <div>
//               <InputBase
//                 placeholder="Search Location"
//                 inputProps={{ 'aria-label': 'search' }}
//               />
//             </div>  
        
//           <Header
//             updateGPSUserLocation={updateGPSUserLocation}
//             updateChosenUserCity={updateChosenUserCity}
//             chosenUserCity={chosenUserCity}
//           />
//           <Switch>
//             <Route
//               path="/"
//               exact
//               render={() => (
//                 <HomePage
//                   gpsUserLocation={gpsUserLocation}
//                   chosenUserCity={chosenUserCity}
//                   updateChosenUserCity={updateChosenUserCity}
//                 />
//               )}
//             />
//             <Route path="/hospital/:hospitalName" component={HospitalFullInfo} />
//           </Switch>
//         </div>
//       </Router>