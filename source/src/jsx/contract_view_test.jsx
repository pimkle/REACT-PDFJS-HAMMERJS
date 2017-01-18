import React from 'react';
import PDF from './node_modules/react-pdf-js';
var Hammer = require('react-hammerjs');

var PdfView = React.createClass({
	getInitialState: function() {
		return {
			ratio: 0.6,
			page: 1,
			zoomRate: 1.5,
			startX: 0,
			startY: 0,
			info: 'nothing',
			Intime: 0,
			Outtime: 0
		};
	},

	render: function () {
		let pagination = null;
		if (this.state.pages) {
			pagination = this.renderPagination(this.state.page, this.state.pages);
		}
		return (
			<div>
				<Hammer
					style={{width: '100%', height: '100%', position: 'fixed'}}
					onPan={this.pan}
					onPinchIn={this.pinchIn}
					onPinchOut={this.pinchOut}
					options={{
						recognizers: {
							pinch: { enable: true }
						}
					}}>
					<div>
						<div id="view-pdf" className={"view-pdf"} style={{top: '0', bottom: 0, overflow: 'hidden'}}>
							<PDF id="pdf-view" file="test.pdf" scale={lib.flexible.dpr * this.state.ratio} onPageComplete={this.onPageComplete} onDocumentComplete={this.onDocumentComplete} page={this.state.page} loading={(<span>合同正在加载中...</span>)} />
						</div>
					</div>
				</Hammer>
				{pagination}
				<div style={{position: 'fixed', top: 0, left: 0}}>{this.state.info}</div>
			</div>
		);
	},

	panStart: function(ev) { // NOT USED
		this.state.startX = ev.center.x;
		this.state.startY = ev.center.y;
	},

	panEnd: function (ev) { // NOT USED
		var deltaX = ev.center.x - this.state.startX;
		var deltaY = ev.center.y - this.state.startY;
		var scrollX = $('#view-pdf').scrollLeft();
		var scrollY = $('#view-pdf').scrollTop();
		$('#view-pdf').scrollLeft(scrollX - deltaX);
		$('#view-pdf').scrollTop(scrollY - deltaY)
	},

	pan: function(ev) {
		var deltaX = ev.deltaX;
		var deltaY = ev.deltaY;
		var scrollX = $('#view-pdf').scrollLeft();
		var scrollY = $('#view-pdf').scrollTop();
		var finalX = scrollX - deltaX * this.state.ratio / 16;
		var finalY = scrollY - deltaY * this.state.ratio / 16;
		if (Math.abs(deltaX) >= 5)
			$('#view-pdf').scrollLeft(finalX);
		if (Math.abs(deltaY) >= 5)
			$('#view-pdf').scrollTop(finalY);
		console.log('deltaX:' + deltaX + ',scrollX:' + scrollX + ',finalX:' + finalX);
		console.log('deltaY:' + deltaY + ',scrollY:' + scrollY + ',finalY:' + finalY);
	},

	pinchIn: function (obj) {
		var ratio = this.state.ratio;
		if (ratio < .45)
			return;
		ratio /= 1.5;
		this.setState({ratio: ratio, info: 'pinchIn:' + ratio});
	},

	pinchOut: function(obj) {
		var ratio = this.state.ratio;
		if (ratio > 2)
			return;
		ratio *= 1.5;
		this.setState({ratio: ratio, info: 'pinchIn:' + ratio});
	},

	onPageComplete(page) {
		this.setState({ page });
	},

	onDocumentComplete: function(pages) {
		this.setState({ page: 1, pages });
	},

	handlePrevious: function() {
		this.setState({ page: this.state.page - 1 });
	},

	handleNext: function() {
		this.setState({ page: this.state.page + 1 });
	},

	zoom: function (isZoomIn) {
		var zoom = this.state.ratio;
		zoom = isZoomIn ? zoom * this.state.zoomRate : zoom / this.state.zoomRate;
		this.setState({ratio : zoom});
	},

	renderPagination: function(page, pages) {
		return (
			<div className="pager">
				<div className="item btn-last" onClick={page == 1 ? null : this.handlePrevious}></div>
				<div className="item btn-next" onClick={page == pages ? null : this.handleNext}></div>
				<div className="item btn-big" onClick={()=>this.zoom(true)}></div>
				<div className="item btn-small" onClick={()=>this.zoom(false)}></div>
			</div>
		)
	}
});

ReactDOM.render(<PdfView/>, document.getElementById('react-body'));
