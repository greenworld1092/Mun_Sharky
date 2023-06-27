
import styled from 'styled-components';
import { TextField } from '@mui/material';
import AutosizeInput from 'react-input-autosize';

export function MUNInput({value, onChange}) {
    return <AutosizeInput
        value={value}
        onChange={onChange}
        inputStyle={{ background: '#111430', border: "1px solid #5C84FF", borderRadius: 6, padding: "9px 19px", outline: 0, fontFamily: "Poppins", fontStyle: 'normal', fontWeight: 400, fontSize: 16, fontHeight: 24, color: 'white'}}
    />
}

export const AmountInput = styled('input')`
    background: #1B1E3D;
    border-radius: 6px;

    padding: 3px 9px;
    outline : 0;

    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    font-size: 18px;
    line-height: 32px;
    /* identical to box height */

    font-feature-settings: 'calt' off;
    @media (max-width: 1024px) {
        font-size : 15px;
        line-height : 24px;
        padding: 3px 9px;
    }

    color: #FFFFFF;
`

export const MUNFixedInput = styled('input')`
    background: #111430;
    border: 1px solid #5C84FF;
    border-radius: 6px;

    padding: 9px 19px;
    width: 100%;

    font-family: 'Poppins';
    font-style: normal;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    /* identical to box height */

    font-feature-settings: 'calt' off;

    text-align: center;
    @media (max-width: 768px) {
        padding: 9px 3px;
    }

    color: #FFFFFF;
`