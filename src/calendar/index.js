import React, {Component} from 'react';
import {
  View,
  ViewPropTypes,
  TouchableOpacity,
  ScrollView,
  Text,
  Dimensions
} from 'react-native';
import PropTypes from 'prop-types';

import XDate from 'xdate';
import dateutils from '../dateutils';
import {xdateToData, parseDate} from '../interface';
import styleConstructor from './style';
import Day from './day/basic';
import moment, { lang } from 'moment';
import UnitDay from './day/period';
import MultiDotDay from './day/multi-dot';
import MultiPeriodDay from './day/multi-period';
import SingleDay from './day/custom';
import CalendarHeader from './header';
import shouldComponentUpdate from './updater';
const SCREEN_HEIGHT= Dimensions.get('window').height;
//Fallback when RN version is < 0.44
const viewPropTypes = ViewPropTypes || View.propTypes;

const EmptyArray = [];
const weekList=[
  { name: 'Monday', spanish_name:'Lunes'}, 
  { name: "Tuesday", spanish_name:'Martes'},
  { name: "Wednesday", spanish_name:'Miércoles'},
  {  name: "Thursday", spanish_name:'Jueves'},
  {  name: "Friday", spanish_name:'Viernes'},
  {  name: "Saturday", spanish_name:'Sábado'},
  {  name: "Sunday", spanish_name:'Domingo'},
  ];
class Calendar extends Component {
  static propTypes = {
    // Specify theme properties to override specific styles for calendar parts. Default = {}
    theme: PropTypes.object,
    // Collection of dates that have to be marked. Default = {}
    markedDates: PropTypes.object,

    // Specify style for calendar container element. Default = {}
    style: viewPropTypes.style,
    // Initially visible month. Default = Date()
    current: PropTypes.any,
    // Minimum date that can be selected, dates before minDate will be grayed out. Default = undefined
    minDate: PropTypes.any,
    // Maximum date that can be selected, dates after maxDate will be grayed out. Default = undefined
    maxDate: PropTypes.any,

    // If firstDay=1 week starts from Monday. Note that dayNames and dayNamesShort should still start from Sunday.
    firstDay: PropTypes.number,

    // Date marking style [simple/period/multi-dot/multi-period]. Default = 'simple' 
    markingType: PropTypes.string,

    // Hide month navigation arrows. Default = false
    hideArrows: PropTypes.bool,
    // Display loading indicador. Default = false
    displayLoadingIndicator: PropTypes.bool,
    // Do not show days of other months in month page. Default = false
    hideExtraDays: PropTypes.bool,

    // Handler which gets executed on day press. Default = undefined
    onDayPress: PropTypes.func,
    // Handler which gets executed on day long press. Default = undefined
    onDayLongPress: PropTypes.func,
    // Handler which gets executed when visible month changes in calendar. Default = undefined
    onMonthChange: PropTypes.func,
    onVisibleMonthsChange: PropTypes.func,
    // Replace default arrows with custom ones (direction can be 'left' or 'right')
    renderArrow: PropTypes.func,
    // Provide custom day rendering component
    dayComponent: PropTypes.any,
    // Month format in calendar title. Formatting values: http://arshaw.com/xdate/#Formatting
    monthFormat: PropTypes.string,
    // Disables changing month when click on days of other months (when hideExtraDays is false). Default = false
    disableMonthChange: PropTypes.bool,
    //  Hide day names. Default = false
    hideDayNames: PropTypes.bool,
    // Disable days by default. Default = false
    disabledByDefault: PropTypes.bool,
    // Show week numbers. Default = false
    showWeekNumbers: PropTypes.bool,
    // Handler which gets executed when press arrow icon left. It receive a callback can go back month
    onPressArrowLeft: PropTypes.func,
    // Handler which gets executed when press arrow icon left. It receive a callback can go next month
    onPressArrowRight: PropTypes.func,
    // Handler which gets executed when press on Year / Month in header
    onPressYear: PropTypes.func,
    language:PropTypes.string,
    onPressMonth: PropTypes.func,
    monthList:PropTypes.any,
    onOkPress:PropTypes.func,
  };

  constructor(props) {
    super(props);
    this.style = styleConstructor(this.props.theme);
    let currentMonth;
    if (props.current) {
      currentMonth = parseDate(props.current);
    } else {
      currentMonth = XDate();
    }
    let years= 1976;
    let maxYear=2010;
    let yarray=[];
    for(years;years<=maxYear;years++)
    {
      yarray.push(years);
    }
    this.state = {
      currentMonth,
      monthList:[{ id: "01", name: 'January', spanish_name:'Enero'}, 
      { id: "02", name: "February", spanish_name:'Febrero'},
      { id: "03", name: "March", spanish_name:'Marzo'},
      { id: "04", name: "April", spanish_name:'Abril'},
      { id: "05", name: "May", spanish_name:'Mayo'},
      { id: "06", name: "June", spanish_name:'Junio'},
      { id: "07", name: "July", spanish_name:'Julio'},
      { id: "08", name: "August", spanish_name:'Agosto'},
      { id: "09", name: "September", spanish_name:'Septiembre'},
      { id: "10", name: "October", spanish_name:'Octubre'},
      { id: "11", name: "November", spanish_name:'Noviembre'},
      { id: "12", name: "December", spanish_name:'Diciembre'},
  ],
      yearsList:yarray,
      showYearPicker:false,
      isMonth:false,     
    };

    this.updateMonth = this.updateMonth.bind(this);
    this.addMonth = this.addMonth.bind(this);
    this.pressDay = this.pressDay.bind(this);
    this.longPressDay = this.longPressDay.bind(this);
    this.shouldComponentUpdate = shouldComponentUpdate;
  }

//   onDayPress = (dayy) => {
//     let day = moment(dayy.dateString).format('DD');  
//    let month = moment(this.state.currentMonth).format('MM');    
//    let year =  moment(this.state.currentMonth).format('YYYY');
//    let selectedYear = year+'-'+month+'-'+day;
//    this.setState({selected: dayy.dateString,selectedYear:selectedYear,dob: selectedYear});
//  }
 
 yearChange=(value,key)=>{
   let dayy = this.state.currentMonth.toString('dd');
   let month = this.state.currentMonth.toString('MM');    
   let year =  this.state.currentMonth.toString('yyyy');

   let searchDate = key=='year'?value+'-'+month+'-'+dayy:year+'-'+value+'-'+dayy;
  //  console.log("searchDate: ",searchDate);
   
   let validDate =  moment(searchDate).isValid();
   let day=validDate?dayy:'01'; 

   let selectedYear = key=='year'?value+'-'+month+'-'+day:year+'-'+value+'-'+day;
   current = parseDate(selectedYear); 
  //  console.log("selectedYear: ",selectedYear);
  
  //  this.setState({currentMonth:current,showYearPicker:false},()=>{});
   let dateyear = key=='year'?value:year;
   let datemonth = key=='year'?month:value;
   let date={
     year: parseInt(dateyear),
     month: parseInt(datemonth),
     day: parseInt(day),
     dateString:selectedYear
   }
   this.pressDay(date) ;
   this.setState({showYearPicker:false},()=>{});
 }


 
onCloseModal= () => {
  this.setState({showYearPicker:false});
 }

  componentWillReceiveProps(nextProps) {
    const current= parseDate(nextProps.current);
    if (current && current.toString('yyyy MM') !== this.state.currentMonth.toString('yyyy MM')) {
      this.setState({
        currentMonth: current.clone()
      });
    }
  }

  updateMonth(day, doNotTriggerListeners) {
    console.log("updateMonth day:",day);
   if (day.toString('yyyy MM') === this.state.currentMonth.toString('yyyy MM')) {
    console.log("updateMonth month equle:");
    this.setState({
      currentMonth: day.clone()
    }, () => {console.log("currentMonth updateMonth equle: ",this.state.currentMonth)})
      return;
    }
    this.setState({
      currentMonth: day.clone()
    }, () => {
      console.log("currentMonth updateMonth: ",this.state.currentMonth)
      
      if (!doNotTriggerListeners) {
        const currMont = this.state.currentMonth.clone();
        // console.log("this.props.onMonthChange: ",this.props.onMonthChange);
        // console.log("this.props.onVisibleMonthsChange: ",this.props.onVisibleMonthsChange);
        if (this.props.onMonthChange) {
          this.props.onMonthChange(xdateToData(currMont));
        }
        if (this.props.onVisibleMonthsChange) {
          this.props.onVisibleMonthsChange([xdateToData(currMont)]);
        }
        //interaction(xdateToData(day));
      }
    });
  }

  _handleDayInteraction(date, interaction) {
    const day = parseDate(date);
    console.log("day: ",day);
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    if (!(minDate && !dateutils.isGTE(day, minDate)) && !(maxDate && !dateutils.isLTE(day, maxDate))) {
      const shouldUpdateMonth = this.props.disableMonthChange === undefined || !this.props.disableMonthChange;
      if (shouldUpdateMonth) {
        console.log("inside updateMonth");
        
        this.updateMonth(day);
      }
      if (interaction) {
        interaction(xdateToData(day));
        console.log("inside interaction");
      }
    }
  }

  pressDay(date) {
    // console.log("pressday: ",date);    
    this._handleDayInteraction(date,this.props.onDayPress);
  }

  longPressDay(date) {
    this._handleDayInteraction(date, this.props.onDayLongPress);
  }

  addMonth(count) {
    this.updateMonth(this.state.currentMonth.clone().addMonths(count, true));
  }

  renderDay(day, id) {
    const minDate = parseDate(this.props.minDate);
    const maxDate = parseDate(this.props.maxDate);
    let state = '';
    if (this.props.disabledByDefault) {
      state = 'disabled';
    } else if ((minDate && !dateutils.isGTE(day, minDate)) || (maxDate && !dateutils.isLTE(day, maxDate))) {
      state = 'disabled';
    } else if (!dateutils.sameMonth(day, this.state.currentMonth)) {
      state = 'disabled';
    } else if (dateutils.sameDate(day, XDate())) {
      state = 'today';
    }
    let dayComp;
    if (!dateutils.sameMonth(day, this.state.currentMonth) && this.props.hideExtraDays) {
      if (['period', 'multi-period'].includes(this.props.markingType)) {
        dayComp = (<View key={id} style={{flex: 1}}/>);
      } else {
        dayComp = (<View key={id} style={this.style.dayContainer}/>);
      }
    } else {
      const DayComp = this.getDayComponent();
      const date = day.getDate();
      dayComp = (
        <DayComp
          key={id}
          state={state}
          theme={this.props.theme}
          onPress={this.pressDay}
          onLongPress={this.longPressDay}
          date={xdateToData(day)}
          marking={this.getDateMarking(day)}
        >
          {date}
        </DayComp>
      );
    }
    return dayComp;
  }

  getDayComponent() {
    if (this.props.dayComponent) {
      return this.props.dayComponent;
    }

    switch (this.props.markingType) {
    case 'period':
      return UnitDay;
    case 'multi-dot':
      return MultiDotDay;
    case 'multi-period':
      return MultiPeriodDay;
    case 'custom':
      return SingleDay;
    default:
      return Day;
    }
  }

  getDateMarking(day) {
    if (!this.props.markedDates) {
      return false;
    }
    const dates = this.props.markedDates[day.toString('yyyy-MM-dd')] || EmptyArray;
    if (dates.length || dates) {
      return dates;
    } else {
      return false;
    }
  }

  renderWeekNumber (weekNumber) {
    return <Day key={`week-${weekNumber}`} theme={this.props.theme} marking={{disableTouchEvent: true}} state='disabled'>{weekNumber}</Day>;
  }

  renderWeek(days, id) {
    const week = [];
    days.forEach((day, id2) => {
      week.push(this.renderDay(day, id2));
    }, this);

    if (this.props.showWeekNumbers) {
      week.unshift(this.renderWeekNumber(days[days.length - 1].getWeek()));
    }

    return (<View style={this.style.week} key={id}>{week}</View>);
  }

  render() {   
      
    let headerlocal = this.state.currentMonth.toString('yyyy')+'-'+this.state.currentMonth.toString('MM')+'-'+this.state.currentMonth.toString('dd');
    let monthList = this.state.monthList;
    let m_tem =  monthList[(moment(headerlocal).format('M'))-1]
    let m = this.props.language=='es'?m_tem.spanish_name:moment(headerlocal).format('MMMM');
    // console.log("m_calender: ",m);
    
    let d_tem =  moment(headerlocal).format('d');
    let dd_tem =  weekList[d_tem==0?(moment(headerlocal).format('d')):(moment(headerlocal).format('d'))-1];
    // console.log("d_tem: ",d_tem);
    // console.log("dd_tem: ",dd_tem);
    let d = this.props.language=='es'?dd_tem.spanish_name:moment(headerlocal).format('dddd');
    // console.log("d_calender: ",d);
    let headerDate= d+' '+moment(headerlocal).format('DD')+' '+m;

    const days = dateutils.page(this.state.currentMonth, this.props.firstDay);
    const weeks = [];
   
    while (days.length) {
      weeks.push(this.renderWeek(days.splice(0, 7), weeks.length));
    }
    let indicator;
    const current = parseDate(this.props.current);
    if (current) {
      const lastMonthOfDay = current.clone().addMonths(1, true).setDate(1).addDays(-1).toString('yyyy-MM-dd');
      if (this.props.displayLoadingIndicator &&
          !(this.props.markedDates && this.props.markedDates[lastMonthOfDay])) {
        indicator = true;
      }
    }
    return (
      <View style={[this.style.container, this.props.style]}>
        <View style={{backgroundColor:'#ff0066',
                  alignItems:'center',
                  paddingVertical:20,
                  }}>
                    <Text style={{color:'#FFF',fontSize:20,fontFamily:'Lato-Bold'}}>{headerDate}</Text>
        </View>
       {!this.state.showYearPicker?<><CalendarHeader
          theme={this.props.theme}
          hideArrows={this.props.hideArrows}
          month={this.state.currentMonth}
          addMonth={this.addMonth}
          showIndicator={indicator}
          firstDay={this.props.firstDay}
          renderArrow={this.props.renderArrow}
          monthFormat={this.props.monthFormat}
          hideDayNames={this.props.hideDayNames}
          weekNumbers={this.props.showWeekNumbers}
          onPressArrowLeft={this.props.onPressArrowLeft}
          onPressArrowRight={this.props.onPressArrowRight}
          onPressMonth={(m)=>{
          this.setState({showYearPicker:true,isMonth:true});
          console.log("monthlist: ",this.state.monthList);
          
        }}
        onPressYear={(v)=>{
          this.setState({showYearPicker:true,isMonth:false});
        }}
        
        language={this.props.language}
        monthList={this.state.monthList}
        />
        
        <View style={this.style.monthView}>{weeks}</View></>:<View style={[this.style.modelStyle,this.style.calendar,{maxHeight:SCREEN_HEIGHT*0.4}]}>
        <ScrollView style={{}}>
          {this.state.isMonth?this.state.monthList.map((month)=>{
            return (<TouchableOpacity key={month.id} onPress={()=>{this.yearChange(month.id,'month')}}>
              <Text style={{marginBottom:10,textAlign:'center'}}>{this.props.language=='es'?month.spanish_name:month.name}</Text>
            </TouchableOpacity>)
        }):this.state.yearsList.map((item)=>{
          return (<TouchableOpacity key={item} onPress={()=>{ this.yearChange(item,'year')}}>
              <Text style={{marginBottom:10,textAlign:'center'}}>{item}</Text>
            </TouchableOpacity>)
        })
        }
          </ScrollView>
        </View>}
        <View style={{
                      alignItems:'flex-end',
                       }}>
                    <TouchableOpacity style={{
                      
                       paddingVertical:20,
                       paddingHorizontal:20,
                       width:80,
                    }} onPress={() =>{this.state.showYearPicker?this.onCloseModal():this.props.onOkPress()}}><Text style={{color:'black',fontSize:18, fontFamily:'Lato-Bold',textAlign:'right'}}>{'ok'}</Text></TouchableOpacity>
                    </View>
      </View>);
  }
}

export default Calendar;
