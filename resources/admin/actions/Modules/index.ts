import Auth from './Auth'
import Blog from './Blog'
import Language from './Language'
import MenuBuilder from './MenuBuilder'
import Settings from './Settings'
const Modules = {
    Auth: Object.assign(Auth, Auth),
Blog: Object.assign(Blog, Blog),
Language: Object.assign(Language, Language),
MenuBuilder: Object.assign(MenuBuilder, MenuBuilder),
Settings: Object.assign(Settings, Settings),
}

export default Modules