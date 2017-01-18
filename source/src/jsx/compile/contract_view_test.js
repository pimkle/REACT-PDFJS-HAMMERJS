'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactPdfJs = require('./node_modules/react-pdf-js');

var _reactPdfJs2 = _interopRequireDefault(_reactPdfJs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Hammer = require('react-hammerjs');

var PdfView = _react2.default.createClass({ displayName: "PdfView",
	getInitialState: function getInitialState() {
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

	render: function render() {
		var pagination = null;
		if (this.state.pages) {
			pagination = this.renderPagination(this.state.page, this.state.pages);
		}
		return _react2.default.createElement("div", null, _react2.default.createElement(Hammer, {
			style: { width: '100%', height: '100%', position: 'fixed' },
			onPan: this.pan,
			onPinchIn: this.pinchIn,
			onPinchOut: this.pinchOut,
			options: {
				recognizers: {
					pinch: { enable: true }
				}
			} }, _react2.default.createElement("div", null, _react2.default.createElement("div", { id: "view-pdf", className: "view-pdf", style: { top: '0', bottom: 0, overflow: 'hidden' } }, _react2.default.createElement(_reactPdfJs2.default, { id: "pdf-view", file: "test.pdf", scale: lib.flexible.dpr * this.state.ratio, onPageComplete: this.onPageComplete, onDocumentComplete: this.onDocumentComplete, page: this.state.page, loading: _react2.default.createElement("span", null, "合同正在加载中...") })))), pagination, _react2.default.createElement("div", { style: { position: 'fixed', top: 0, left: 0 } }, this.state.info));
	},

	panStart: function panStart(ev) {
		// NOT USED
		this.state.startX = ev.center.x;
		this.state.startY = ev.center.y;
	},

	panEnd: function panEnd(ev) {
		// NOT USED
		var deltaX = ev.center.x - this.state.startX;
		var deltaY = ev.center.y - this.state.startY;
		var scrollX = $('#view-pdf').scrollLeft();
		var scrollY = $('#view-pdf').scrollTop();
		$('#view-pdf').scrollLeft(scrollX - deltaX);
		$('#view-pdf').scrollTop(scrollY - deltaY);
	},

	pan: function pan(ev) {
		var deltaX = ev.deltaX;
		var deltaY = ev.deltaY;
		var scrollX = $('#view-pdf').scrollLeft();
		var scrollY = $('#view-pdf').scrollTop();
		var finalX = scrollX - deltaX * this.state.ratio / 16;
		var finalY = scrollY - deltaY * this.state.ratio / 16;
		if (Math.abs(deltaX) >= 5) $('#view-pdf').scrollLeft(finalX);
		if (Math.abs(deltaY) >= 5) $('#view-pdf').scrollTop(finalY);
		console.log('deltaX:' + deltaX + ',scrollX:' + scrollX + ',finalX:' + finalX);
		console.log('deltaY:' + deltaY + ',scrollY:' + scrollY + ',finalY:' + finalY);
	},

	pinchIn: function pinchIn(obj) {
		var ratio = this.state.ratio;
		if (ratio < .45) return;
		ratio /= 1.5;
		this.setState({ ratio: ratio, info: 'pinchIn:' + ratio });
	},

	pinchOut: function pinchOut(obj) {
		var ratio = this.state.ratio;
		if (ratio > 2) return;
		ratio *= 1.5;
		this.setState({ ratio: ratio, info: 'pinchIn:' + ratio });
	},

	onPageComplete: function onPageComplete(page) {
		this.setState({ page: page });
	},


	onDocumentComplete: function onDocumentComplete(pages) {
		this.setState({ page: 1, pages: pages });
	},

	handlePrevious: function handlePrevious() {
		this.setState({ page: this.state.page - 1 });
	},

	handleNext: function handleNext() {
		this.setState({ page: this.state.page + 1 });
	},

	zoom: function zoom(isZoomIn) {
		var zoom = this.state.ratio;
		zoom = isZoomIn ? zoom * this.state.zoomRate : zoom / this.state.zoomRate;
		this.setState({ ratio: zoom });
	},

	renderPagination: function renderPagination(page, pages) {
		var _this = this;

		return _react2.default.createElement("div", { className: "pager" }, _react2.default.createElement("div", { className: "item btn-last", onClick: page == 1 ? null : this.handlePrevious }), _react2.default.createElement("div", { className: "item btn-next", onClick: page == pages ? null : this.handleNext }), _react2.default.createElement("div", { className: "item btn-big", onClick: function onClick() {
				return _this.zoom(true);
			} }), _react2.default.createElement("div", { className: "item btn-small", onClick: function onClick() {
				return _this.zoom(false);
			} }));
	}
});

ReactDOM.render(_react2.default.createElement(PdfView, null), document.getElementById('react-body'));