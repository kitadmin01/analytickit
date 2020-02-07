import React, { Component } from 'react'
import api from './Api';
import { Card, uuid, percentage } from './utils';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select from 'react-select';
import FunnelGraph from 'funnel-graph-js';
import SaveToDashboard from './SaveToDashboard';


export class EditFunnel extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
            actions: [],
            steps: props.funnel && props.funnel.steps || [{id: uuid(), order: 0}],
            name: props.funnel && props.funnel.name,
            id: (props.funnel && props.funnel.id) || props.match.params.id,
        }
        this.Step = this.Step.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.fetchActions.call(this);
        if(this.state.id) this.fetchFunnel.call(this);
    }
    fetchFunnel() {
        api.get('api/funnel/' + this.state.id).then((funnel) => this.setState({steps: funnel.steps, name: funnel.name}))
    }
    fetchActions() {
        api.get('api/action').then((actions) => this.setState({actions: actions.results}))
    }
    Step(step) {
        let { steps, actions } = this.state;
        let selectedAction = actions.filter((action) => action.id == step.action_id)[0];
        return <Card title={'Step ' + (step.order + 1)} style={{maxWidth: '20%'}}>
            <div className='card-body'>
                <Select
                    required
                    onChange={(item) => {
                        this.setState({steps: this.state.steps.map(
                            (s) => s.id == step.id ? {...step, action_id: item.value} : s
                        )}, this.onSubmit)
                    }}
                    defaultOptions
                    options={actions.map((action) => ({label: action.name, value: action.id}))}
                    value={{label: selectedAction && selectedAction.name, value: step.action_id}}
                    />
                {step.action_id && <a target='_blank' href={'/action/' + step.action_id}>Edit action</a>}
            </div>
        </Card>
    }
    onSubmit(event) {
        if(event) event.preventDefault();
        let save = (funnel) => {
            toast('Funnel saved.', {autoClose: 3000, hideProgressBar: true})
            this.props.onChange && this.props.onChange(funnel)
        }
        let data = {
            name: this.state.name,
            id: this.state.id,
            steps: this.state.steps
        }
        if(this.state.id) {
            return api.update('api/funnel/' + this.state.id, data).then(save)
        }
        api.create('api/funnel', data).then((funnel) => this.props.history.push('/funnel/' + funnel.id))
    }
    render() {
        return <form onSubmit={this.onSubmit}>
            <label>Name</label>
            <input required placeholder='User drop off through signup' type='text' onChange={(e) => this.setState({name: e.target.value})} value={this.state.name} onBlur={() => this.onSubmit()} className='form-control' />
            <br /><br />
            <div className='card-deck'>
                {this.state.steps.map((step) => <this.Step key={step.id} {...step} />)}
                <div
                    className='card cursor-pointer'
                    onClick={() => this.setState({steps: [...this.state.steps, {id: uuid(), order: this.state.steps.length}]})}
                    style={{maxWidth: '20%'}}>
                    <span style={{fontSize: 75, textAlign: 'center', lineHeight: 1}} className='text-success'>+</span>
                </div>
            </div>
            <br /><br />
            {this.state.saved && <p className='text-success'>Funnel saved. <Link to={'/funnel/' + this.state.id}>Click here to go back to the funnel.</Link></p>}
        </form>
    }
}

EditFunnel.propTypes = {
    history: PropTypes.object,
    funnel: PropTypes.object
}

export class FunnelViz extends Component {
    container = React.createRef();
    graphContainer = React.createRef();
    constructor(props) {
        super(props)
    
        this.state = {
            funnel: props.funnel
        }
        this.buildChart = this.buildChart.bind(this);
        if(!props.funnel) this.fetchFunnel.call(this);
    }
    componentDidMount() {
        if(this.props.funnel) this.buildChart();
        window.addEventListener('resize', this.buildChart)
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.buildChart)
    }
    fetchFunnel() {
        api.get('api/funnel/' + this.props.filters.funnel_id).then((funnel) => this.setState({funnel}, this.buildChart))
    }
    componentDidUpdate(prevProps) {
        if(prevProps.datasets !== this.props.datasets && this.state.funnel) {
            this.buildChart();
        }
    }
    buildChart() {
        if(this.container.current) this.container.current.innerHTML = '';
        if(!this.state.funnel) return;
        let graph = new FunnelGraph({
            container: '.funnel-graph',
            data: {
                labels: this.state.funnel.steps.map((step) => `${step.name} (${step.count})`),
                values: this.state.funnel.steps.map((step) => step.count),
                colors: ['#66b0ff', 'var(--blue)']
            },
            displayPercent: true
        });
        graph.createContainer = () => {}
        graph.container = this.container.current;
        graph.graphContainer = document.createElement('div');
        graph.graphContainer.classList.add('svg-funnel-js__container');
        graph.container.appendChild(graph.graphContainer);

        graph.draw();
    }
    render() {

        return (
            <div ref={this.container} className='svg-funnel-js' style={{height: '100%', width: '100%'}}>
            </div>
        )
    }
}
FunnelViz.propTypes = {
    funnel: PropTypes.object,
    filters: PropTypes.shape({funnel_id: PropTypes.number})
}

export default class Funnel extends Component {
    constructor(props) {
        super(props)
    
        this.state = {
        }
        this.fetchFunnel.call(this);
        this.sortPeople = this.sortPeople.bind(this);
    }
    sortPeople(people) {
        let score = (person) => {
            return this.state.funnel.steps.reduce((val, step) => 
                step.people.indexOf(person.id) > -1 ? val + 1 : val
            , 0)
        }
        people.sort((a, b) => score(b) - score(a))
        return people
    }
    fetchFunnel() {
        api.get('api/funnel/' + this.props.match.params.id).then((funnel) => {
            this.setState({funnel})
            api.get('api/person/?id=' + funnel.steps[0].people.join(','))
                .then((people) => this.setState({people: this.sortPeople(people.results)}))
        })
    }
    render() {
        let { funnel, people } = this.state;
        return funnel ? (
            <div className='funnel'>
                <h1>Funnel: {funnel.name}</h1>
                <EditFunnel funnel={funnel} onChange={(funnel) => this.setState({funnel})} />
                <Card title={<span>
                    <SaveToDashboard className='float-right' filters={{funnel_id: funnel.id}} type='FunnelViz' name={funnel.name} />
                    Graph
                </span>}>
                    <div style={{height: 300}}>
                        {funnel.steps && <FunnelViz
                            funnel={funnel}
                            />}
                    </div>
                </Card>
                <Card title='Per user'>
                    <table className='table table-bordered table-fixed'>
                        <tbody>
                            <tr>
                                <td></td>
                                {funnel.steps.map((step) => <th key={step.id}>
                                    <Link to={'/action/' + step.action_id}>{step.name}</Link>
                                </th>)}</tr>
                            <tr>
                                <td></td>
                                {funnel.steps.map((step) => <td key={step.id}>
                                    {step.count}&nbsp;
                                    ({percentage(step.count/funnel.steps[0].count)})
                                </td>)}
                            </tr>
                            {people && people.map((person) => <tr key={person.id}>
                                <td><Link to={'/person/' + person.id}>{person.name}</Link></td>
                                {funnel.steps.map((step) => <td
                                    key={step.id}
                                    className={step.people.indexOf(person.id) > -1 ? 'funnel-success' : 'funnel-dropped'}
                                    ></td>)}
                            </tr>)}
                        </tbody>
                    </table>
                </Card>
            </div>
        ) : null;
    }
}
