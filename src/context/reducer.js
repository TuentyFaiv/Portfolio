export const reducer = (state, action) => {
  switch (action.type) {
    case 'THEME':
      typeof window !== 'undefined' && localStorage.setItem('theme', action.payload ? 'dark' : 'light');
      return {
        ...state,
        dark: !state.dark,
      };
    case 'NATIVE':
      typeof window !== 'undefined' && localStorage.setItem('view', action.payload ? 'native' : 'no-native');
      return {
        ...state,
        native: action.payload,
      }
    default:
      return state;
  }
};