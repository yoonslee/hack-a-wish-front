/* eslint react/no-danger: 0 */
import React, { Component } from 'react';
import uuidv4 from 'uuid/v4';
import {
  Container,
  Row,
  Col,
  // Button, Form, Table
} from 'reactstrap';
import update from 'immutability-helper';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withSnackbar } from 'notistack';

import ChildRow from '../components/ChildRow';

import {
  createChildren,
  CREATE_CHILDREN_SUCCESS,
  getChildren,
  deleteChild,
  DELETE_CHILD_SUCCESS,
} from '../actions/child';

import {
  // MALE,
  FEMALE,
} from '../utils/constants';

const initChild = () => ({
  _id: uuidv4(),
  firstName: '',
  lastName: '',
  gender: FEMALE,
  age: '',
  condition: '',
  story: '',
  wish: '',
  // interests: [],
  amountDonatedByUser: 345,
  amountDonatedByOthers: 1000,
  amountToCompletion: 4000,
});

class ChildrenContainer extends Component {
  state = {
    children: [initChild()],
  };

  componentDidMount() {
    this.props.getChildren();
  }

  editChild = (_id, key, value) => {
    const { children } = this.state;

    const cIndex = children.findIndex(c => c._id === _id);

    if (cIndex === -1) return;

    const newChildren = update(children, {
      [cIndex]: {
        [key]: { $set: value },
      },
    });

    this.setState({ children: newChildren });
  };

  addChildForm = () => {
    const { children } = this.state;

    const newChildren = update(children, {
      $push: [initChild()],
    });

    this.setState({ children: newChildren });
  };

  deleteChildForm = _id => {
    const { children } = this.state;

    const cIndex = children.findIndex(c => c._id === _id);

    if (cIndex === -1) return;

    const newChildren = update(children, {
      $splice: [[cIndex, 1]],
    });

    this.setState({ children: newChildren });
  };

  prepareChildren = children => {
    const childrenCopy = [...children];

    childrenCopy.forEach(c => {
      delete c._id;
    });

    return childrenCopy;
  };

  createChildren = () => {
    const preparedChildren = this.prepareChildren(this.state.children);

    this.props.createChildren(preparedChildren).then(res => {
      if (res.type === CREATE_CHILDREN_SUCCESS) {
        this.setState({ children: [initChild()] });

        this.props.enqueueSnackbar('Children created', {
          variant: 'success',
          autoHideDuration: 3000,
        });

        return this.props.getChildren();
      }
    });
  };

  deleteChild = childId => {
    const shouldDelete = window.confirm(
      'Are you sure you want to delete this child?',
    );

    if (!shouldDelete) return;

    return this.props.deleteChild(childId).then(res => {
      if (res.type === DELETE_CHILD_SUCCESS) {
        return this.props.enqueueSnackbar('Child deleted', {
          variant: 'success',
          autoHideDuration: 3000,
        });
      }
    });
  };

  render() {
    return (
      <Container fluid className="child-container">
        <Row>
          <Col>
            {Array.isArray(this.props.child) &&
              this.props.child.map((c, i) => (
                <ChildRow key={c._id} child={c} history={this.props.history} />
              ))}
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withSnackbar(
  connect(
    state => ({ child: state.child.child }),
    dispatch =>
      bindActionCreators(
        {
          createChildren,
          getChildren,
          deleteChild,
        },
        dispatch,
      ),
  )(ChildrenContainer),
);
