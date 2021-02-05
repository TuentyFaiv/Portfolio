import React, { createContext, useContext, useReducer } from 'react';
import PropTypes from 'prop-types';


export const Context = createContext();

export const Provider = ({ reducer, children }) => {
  const initialState = {
    dark: false,
    native: false,
    mainRef: null,
  };

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