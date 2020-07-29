import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';


export const Context = createContext();

export const Provider = ({ reducer, children }) => {
  let initialState

  if (typeof window !== 'undefined') {
    initialState = {
      dark: localStorage.getItem('theme') === 'dark' ? true : false,
      native: localStorage.getItem('view') === 'native' ? true : false,
    };
  } else {
    initialState = {
      dark: false,
      native: false,
    };
  }

  return (
    <Context.Provider value={useReducer(reducer, initialState)}>
      {children}
    </Context.Provider>
  )
};

export const useGlobalState = () => useContext(Context);

Provider.propTypes = {
  children: PropTypes.node.isRequired,
  reducer: PropTypes.func.isRequired
};