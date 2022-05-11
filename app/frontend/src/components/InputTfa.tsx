import React, {CSSProperties, useEffect, useRef, useState} from 'react';
import {TextField} from '@mui/material';

const styles : Record<string, CSSProperties>= {
  row: {
    display: 'flex',
    marginTop: '16px',
    justifyContent: 'space-between',
    width: '280px'
  },
  input: {
    maxWidth: '8px',
    paddingTop: '12px',
    paddingBottom: '12px',
  },
}

type Props = {
  length: number,
  validate: (code: string) => void,
  error: boolean
}

const InputTfa: React.FC<Props> = ({ length, validate, error }) => {
  const basis = Array.from(new Array(length), () => 0);
  const [ border, setBorder ] = useState(false);
  const [ activationCode, setActivationCode ] = useState(basis.map(() => ''));
  const refs = useRef(new Array(length) as (HTMLInputElement | null)[]);

  useEffect(() => {
    if (error)
    {
      refs.current[0]?.focus();
      setBorder(true);
    }
  }, [error, length, setActivationCode]);

  const update = (value: string, index: number) => {
    if (value && (value[0] < '0' || value[0] > '9'))
      return ;
    const v = [...activationCode];
    v[index] = value;
    setActivationCode(v);
    setBorder(false);
    if (index < length - 1)
      refs.current[index + 1]?.focus();
  }

  useEffect(() => {
    const code = activationCode.join('');
    if (code.length === length) {
      validate(code);
      setActivationCode(Array.from(new Array(length), () => ''));
    }
  }, [validate, activationCode, length])

  const reverse = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === "Backspace" || event.key === 'Delete')
    {
      if (index > 0)
      {
        const v = [...activationCode];
        v[index - 1] = '';
        setActivationCode(v);
        refs.current[index - 1]?.focus();
      }
    }
  }

  const focus = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    let first = activationCode.slice(0, index).indexOf('');
    if (index !== first) {
      refs.current[first]?.focus();
      e.preventDefault();
    }
  }

  return <div style={styles.row}>
    {basis.map((e, i) =>
      <TextField key={i} style={styles.field}
        autoFocus={ i === 0 }
        value={activationCode[i]}
        error={border}
        onClick={(e) => focus(e, i)}
        onKeyDown={e => reverse(e, i)}
        onChange={event => update(event.target.value, i) } inputProps={{ maxLength: 1, ref: (e: HTMLInputElement) => refs.current[i] = e, style: styles.input }} />)}
  </div>;
}

export default InputTfa;
