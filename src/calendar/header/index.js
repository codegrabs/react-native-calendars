import React, { Component } from 'react';
import { ActivityIndicator } from 'react-native';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import XDate from 'xdate';
import PropTypes from 'prop-types';
import styleConstructor from './style';
import { weekDayNames } from '../../dateutils';
const weekDaysNamesSpanish=['Dom','Lun','mar','Mie','Jue','Vie','sábado'];
const monthNames=[{ id: "01", en: 'January', es:'Enero'}, 
      { id: "02", en: "February", es:'Febrero'},
      { id: "03", en: "March", es:'Marzo'},
      { id: "04", en: "April", es:'Abril'},
      { id: "05", en: "May", es:'Mayo'},
      { id: "06", en: "June", es:'Junio'},
      { id: "07", en: "July", es:'Julio'},
      { id: "08", en: "August", es:'Agosto'},
      { id: "09", en: "September", es:'Septiembre'},
      { id: "10", en: "October", es:'Octubre'},
      { id: "11", en: "November", es:'Noviembre'},
      { id: "12", en: "December", es:'Diciembre'},
  ];
class CalendarHeader extends Component {
  static propTypes = {
    theme: PropTypes.object,
    hideArrows: PropTypes.bool,
    month: PropTypes.instanceOf(XDate),
    addMonth: PropTypes.func,
    showIndicator: PropTypes.bool,
    firstDay: PropTypes.number,
    renderArrow: PropTypes.func,
    hideDayNames: PropTypes.bool,
    weekNumbers: PropTypes.bool,
    onPressArrowLeft: PropTypes.func,
    onPressArrowRight: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(props.theme);
    this.addMonth = this.addMonth.bind(this);
    this.substractMonth = this.substractMonth.bind(this);
    this.onPressLeft = this.onPressLeft.bind(this);
    this.onPressRight = this.onPressRight.bind(this);   

     m_tem =  this.props.monthList[(this.props.month.toString('M'))-1];
    console.log("this.props.monthFormat: ",this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM'));
  }

  addMonth() {
    this.props.addMonth(1);
  }

  substractMonth() {
    this.props.addMonth(-1);
  }

  shouldComponentUpdate(nextProps) {
    if (
      nextProps.month.toString('yyyy MM') !==
      this.props.month.toString('yyyy MM')
    ) {
      return true;
    }
    if (nextProps.showIndicator !== this.props.showIndicator) {
      return true;
    }
    if (nextProps.hideDayNames !== this.props.hideDayNames) {
      return true;
    }
    return false;
  }

  onPressLeft() {
    const {onPressArrowLeft} = this.props;
    console.log("onPressArrowLeft: ",onPressArrowLeft);
    
    if(typeof onPressArrowLeft === 'function') {
      return onPressArrowLeft(this.substractMonth);
    }
    return this.substractMonth();
  }

  onPressRight() {
    const {onPressArrowRight} = this.props;
    if(typeof onPressArrowRight === 'function') {
      return onPressArrowRight(this.addMonth);
    }
    return this.addMonth();
  }

  render() {
    let leftArrow = <View />;
    let rightArrow = <View />;
    let weekDaysNames = weekDayNames(this.props.firstDay);
    if (!this.props.hideArrows) {
      leftArrow = (
        <TouchableOpacity
          onPress={this.onPressLeft}
          style={this.style.arrow}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('left')
            : <Image
                source={require('../img/previous.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
      rightArrow = (
        <TouchableOpacity
          onPress={this.onPressRight}
          style={this.style.arrow}
          hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
        >
          {this.props.renderArrow
            ? this.props.renderArrow('right')
            : <Image
                source={require('../img/next.png')}
                style={this.style.arrowImage}
              />}
        </TouchableOpacity>
      );
    }
    let indicator;
    if (this.props.showIndicator) {
      indicator = <ActivityIndicator />;
    }
    return (
      <View>
        <View style={this.style.header}>
          {leftArrow}
          <TouchableOpacity disabled={!this.props.onPressMonth} onPress={this.props.onPressMonth}>
            <View style={{}}>
            <Text allowFontScaling={false} style={this.style.monthText} accessibilityTraits='header'>
               {/* {this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM')} */}
               {/* {this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM')} */}

               {/* {console.log('this.props.month',this.props.month,' m ',this.props.month.toString('M'))} */}
               {(this.props.monthFormat==undefined && this.props.language=='es') && this.props.month?monthNames[this.props.month.toString('M')-1][this.props.language]:this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'MMMM')}
              </Text>
              {indicator}
            </View>
          </TouchableOpacity>
          <TouchableOpacity disabled={!this.props.onPressYear} onPress={this.props.onPressYear}>
            <View style={{}}>
            {/* flexDirection: 'row'  */}
              <Text allowFontScaling={false} style={this.style.monthText} accessibilityTraits='header'>
                {this.props.month.toString(this.props.monthFormat ? this.props.monthFormat : 'yyyy')}
              </Text>
              {indicator}
            </View>
          </TouchableOpacity>
          {rightArrow}
        </View>
         {
          !this.props.hideDayNames &&
          <View style={this.style.week}>
            {this.props.weekNumbers && <Text allowFontScaling={false} style={this.style.dayHeader}></Text>}
            {this.props.language=='es'?weekDaysNamesSpanish.map((day, idx) => (
              <Text allowFontScaling={false} key={idx} accessible={false} style={this.style.dayHeader} numberOfLines={1} importantForAccessibility='no'>{day}</Text>
            )):weekDaysNames.map((day, idx) => (
              <Text allowFontScaling={false} key={idx} accessible={false} style={this.style.dayHeader} numberOfLines={1} importantForAccessibility='no'>{day}</Text>
            ))
            }

            {/* {weekDaysNames.map((day, idx) => (
              <Text allowFontScaling={false} key={idx} accessible={false} style={this.style.dayHeader} numberOfLines={1} importantForAccessibility='no'>{day}</Text>
            ))} */}

          </View>
        }
      </View>
    );
  }
}

export default CalendarHeader;
