import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { library } from "@fortawesome/fontawesome-svg-core";

import Navigator from '~/components/navs/Navigation';
import LeftHomePage from '~/components/homePage/LeftHomePage';
import CenterHomePage from '~/components/homePage/CenterHomePage';
import RightHomePage from '~/components/homePage/RightHomePage';
import MusicPlayerBar from '~/components/homePage/MusicPlayerBar';

import "./HomePage.sass";

library.add(faPlay);

const HomePage = () => {

    return (
        <div className='homePage'>
            <Navigator />
            <div className="content">
                <LeftHomePage />
                <CenterHomePage />
                <RightHomePage />
            </div>

            <MusicPlayerBar />

        </div>
    );
};

export default HomePage;
