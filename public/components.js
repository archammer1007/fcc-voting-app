var isNode = typeof module !== 'undefined' && module.exports;
var React = isNode ? require('react') : window.React;
var ReactDOM = isNode ? require('react') : window.ReactDOM;

var PollCreationForm = React.createClass({
    getInitialState: function(){
      return {
        name: '',
        options: ['', '']  
      }
    },
    addOption: function(){
        var options = this.state.options.slice();
        options.push('');
        this.setState({
          options: options
        })
    },
    deleteOption: function(index){
      var options = this.state.options.slice();
      options.splice(index,1);
      this.setState({options: options})
    },
    editPollName: function(event){
        this.setState({
            name: event.target.value
        })
    },
    editOption: function(event, index){
        var options = this.state.options.slice();
        options[index] = event.target.value;
        this.setState({
            options: options
        })
    },
    handleSubmit: function(e){
        e.preventDefault();
        var name = this.state.name;
        var options = this.state.options;
        if (!name){
            return;
        }
        var newPoll = {name: name, options: options}
        $.ajax({
            url: '/create',
            dataType: 'json',
            type: 'POST',
            data: newPoll,
            success: function(data){
                window.location = (data.redirect)
            }
        })
    },
    render: function(){
      var options = this.state.options.map(function(option, i){
        return <PollOptionBox deleteOption={this.deleteOption} editOption={this.editOption} option={option} index={i} key={i} />
      }, this)
        return (
          <form onSubmit={this.handleSubmit} >
            <div className='row'>
                <div className='col-md-6'>
                    <label>Poll Title</label>
                    <input onChange={this.editPollName} value={this.state.name}></input>
                    <input type='submit' className='btn btn-default' value="Create Poll"></input>
                </div>
                <div className='col-md-6'>
                    <label>Options</label>
                    {options}
                    <input type='button' className='btn btn-default' onClick={this.addOption} value="Add Option"></input>
                </div>
            </div>
          </form>
        )
    }
})

var PollOptionBox = React.createClass({
    handleChange: function(event){
        this.props.editOption(event, this.props.index)
    },
    handleClick: function(){
        this.props.deleteOption(this.props.index)
    },
    render: function(){
        var deleteButton;
        if (this.props.index >= 2){
            deleteButton = <input type='button' className='btn btn-default' onClick={this.handleClick} value='Remove Option'></input>
        }
        return (
            <div>
                <input onChange={this.handleChange} value={this.props.option}></input>
                {deleteButton}
            </div>
        )
    }
});


if (isNode) {
    exports.PollCreationForm = PollCreationForm;
}
else {
    ReactDOM.render(<PollCreationForm />, document.getElementById('react-root'));
}