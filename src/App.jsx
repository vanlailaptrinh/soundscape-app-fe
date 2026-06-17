import AppRoutes from './router/AppRoutes';
import LibrarySong from '~/components/librarySong/LibrarySong';
import AiPlaylistPopup from '~/components/popup/AiPlaylistPopup';

const App = () => {
    return (
        <div className="app-container">
            <AppRoutes />
            <LibrarySong />
            <AiPlaylistPopup />
        </div>
    );
};

export default App;
