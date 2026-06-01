import AppRoutes from './router/AppRoutes';
import LibrarySong from '~/components/librarySong/LibrarySong';

const App = () => {
    return (
        <div className="app-container">
            <AppRoutes />
            <LibrarySong />
        </div>
    );
};

export default App;
