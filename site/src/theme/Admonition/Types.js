import React from 'react';
import DefaultAdmonitionTypes from '@theme-original/Admonition/Types';
import useBaseUrl from '@docusaurus/useBaseUrl';

function OpenTelemetryTipAdmonition(props) {
    return (
        <div className={'admonition-custom'}>
            <div className={'icon-container'}>
                <img src={useBaseUrl('/img/opentelemetry-icon.svg')} alt="OpenTelemetry icon"/>
            </div>
            <div>
                <div className={'heading'}>{props.title}</div>
                <div className={'content'}>{props.children}</div>
            </div>
        </div>
    );
}

function GrotTipAdmonition(props) {
    return (
        <div className={'admonition-custom'}>
            <div className={'icon-container'}>
                <img src={useBaseUrl('/img/grot-teaching.png')} alt="Grot teaching a class"/>
            </div>
            <div>
                <div className={'heading'}>{props.title}</div>
                <div className={'content'}>{props.children}</div>
            </div>
        </div>
    )
}

function AssistantAdmonition(props) {
    return (
        <div className={'admonition-custom'}>
            <div className={'icon-container'}>
                <img src={useBaseUrl('/img/assistant.svg')} alt="Grafana Assistant"/>
            </div>
            <div>
                <div className={'heading'}>{props.title}</div>
                <div className={'content'}>{props.children}</div>
            </div>
        </div>
    )
}

const AdmonitionTypes = {
    ...DefaultAdmonitionTypes,

    // Add all your custom admonition types here...
    // You can also override the default ones if you want
    'opentelemetry-tip': OpenTelemetryTipAdmonition,
    'grot-tip': GrotTipAdmonition,
    'assistant-tip': AssistantAdmonition,
};

export default AdmonitionTypes;
