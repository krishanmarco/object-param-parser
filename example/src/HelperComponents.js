import React from 'react';
import _ from 'lodash';
import JSONPretty from 'react-json-pretty';
import JSONPrettyMon from 'react-json-pretty/dist/monikai';

// Component to print props to screen as JSON
export const PrintProps = ({id, data}) => {
  function replacer(key, value) {
    if (_.isFunction(value)) {
      return 'FUNCTION';
    }
    return value;
  }

  return (
    <JSONPretty
      id={id}
      theme={JSONPrettyMon}
      data={data}
      replacer={replacer}/>
  );
};

export const DemoButton = ({name, desc, func}) => (
  <div style={styles.demoButtonCont}>
    <button
      style={styles.demoButtonButton}
      onClick={func}>
      {name}
    </button>
    <p style={styles.demoButtonText}>
      {desc}
    </p>
  </div>
);

export const ExplanationSection = ({buttons}) => (
  <div style={styles.explanationSectionRoot}>
    {buttons.map(({...props}, idx) => (
      <DemoButton
        key={idx}
        {...props}/>
    ))}
  </div>
);

const styles = {
  explanationSectionRoot: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    display: 'inline-flex',
    textAlign: 'center',
  },
  demoButtonCont: {
    width: 128,
    textAlign: 'center',
  },
  demoButtonButton: {
    fontSize: 10,
  },
  demoButtonText: {
    fontSize: 9,
    fontStyle: 'italic'
  },
};

