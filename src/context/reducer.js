export const reducer = (state, action) => {
  switch (action.type) {
    case 'THEME':
      window.localStorage.setItem('theme', action.payload ? 'dark' : 'light');
      return {
        ...state,
        dark: !state.dark,
      };
    case 'NATIVE':
      window.localStorage.setItem('view', action.payload ? 'native' : 'no-native');
      return {
        ...state,
        native: action.payload,
      }
    default:
      return state;
  }
};