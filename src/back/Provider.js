import React, { createContext, useState, useEffect, Children } from 'react';
// import { supabase } from './ConexaoBD';
// import bcrypt from 'bcryptjs';
// import forge from 'node-forge';
export const AppContext = createContext();

export const AppProvider = ({children}) => {
    return (
        <AppContext.Provider value={{
            
        }}>
            {children}
        </AppContext.Provider>
    );
};