import React, { Component } from "react";
import moment from "moment";
import classNames from "classnames";

class Header extends Component {
  static defaultProps = {
    inputReadOnly: false,
  };

  constructor(props) {
    super(props);
    const { value, format } = props;
    this.state = {
      str: (value && value.format(format)) || "",
      invalid: false,
    };
  }

  componentDidMount() {
    const { focusOnOpen } = this.props;
    if (focusOnOpen) {
      // requestAnimationFrame will cause jump on rc-trigger 3.x
      // https://github.com/ant-design/ant-design/pull/19698#issuecomment-552889571
      // use setTimeout can resolve it
      // 60ms is a magic timeout to avoid focusing before dropdown reposition correctly
      this.timeout = setTimeout(() => {
        this.refInput.focus();
        this.refInput.select();
      }, 60);
    }
  }

  componentDidUpdate(prevProps) {
    const { value, format } = this.props;
    if (value !== prevProps.value) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        str: (value && value.format(format)) || "",
        invalid: false,
      });
    }
  }

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  onInputChange = (event) => {
    if (this.props.isCustom12HourFormat) {
      let oldStr = this.state.str;
      let str = event.target.value;
      let newStr = str;
      if (newStr) {
        if (str.length < oldStr.length) {
          newStr = str;
        } else if (newStr.length === 2 && /^\d+$/.test(newStr)) {
          if (parseInt(newStr) > 12) {
            let secondChar = parseInt(newStr[1]);
            newStr = `0${newStr[0]}:${secondChar > 5 ? 5 : secondChar}`;
          } else {
            newStr = newStr + ":";
          }
        } else if (newStr.length === 5 && /^\d+$/.test(newStr[4])) {
          newStr = newStr + " ";
        } else if (newStr.length === 7) {
          if (/[pP]/.test(newStr[6])) {
            newStr = `${str.substring(0, 6)}pm`;
          } else {
            newStr = `${str.substring(0, 6)}am`;
          }
        } else if (newStr.length === 8) {
          newStr = `${str.substring(0, 7)}m`;
        } else if (newStr.length === 1 && !/^\d+$/.test(newStr)) {
          return;
        } else if (newStr.length === 4) {
          if (/^\d+$/.test(newStr[3]) && parseInt(newStr[3]) <= 5) {
            newStr = str;
          } else {
            return;
          }
        } else if (newStr.length === 5 && !/^\d+$/.test(newStr[4])) {
          return;
        } else if (newStr.length === 6 && !/\s/.test(newStr[5])) {
          newStr = `${str.substring(0, 5)} `;
        } else if (newStr.length > 8) {
          return;
        } else {
          // nothing
        }
      }
      str = newStr;
      this.setState({
        str,
        invalid: /[0-9][0-9]:[0-9][0-9]\s(?:am|pm)/.test(str) ? false : true,
      });
      const {
        format,
        hourOptions,
        minuteOptions,
        secondOptions,
        disabledHours,
        disabledMinutes,
        disabledSeconds,
        onChange,
      } = this.props;

      if (str && /[0-9][0-9]:[0-9][0-9]\s(?:am|pm)/.test(str)) {
        const { value: originalValue } = this.props;
        const value = this.getProtoValue().clone();
        const parsed = moment(str, format, true);
        if (!parsed.isValid()) {
          this.setState({
            invalid: true,
          });
          return;
        }
        value
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());

        // if time value not allowed, response warning.
        if (
          hourOptions.indexOf(value.hour()) < 0 ||
          minuteOptions.indexOf(value.minute()) < 0 ||
          secondOptions.indexOf(value.second()) < 0
        ) {
          this.setState({
            invalid: true,
          });
          return;
        }

        // if time value is disabled, response warning.
        const disabledHourOptions = disabledHours();
        const disabledMinuteOptions = disabledMinutes(value.hour());
        const disabledSecondOptions = disabledSeconds(
          value.hour(),
          value.minute()
        );
        if (
          (disabledHourOptions &&
            disabledHourOptions.indexOf(value.hour()) >= 0) ||
          (disabledMinuteOptions &&
            disabledMinuteOptions.indexOf(value.minute()) >= 0) ||
          (disabledSecondOptions &&
            disabledSecondOptions.indexOf(value.second()) >= 0)
        ) {
          this.setState({
            invalid: true,
          });
          return;
        }

        if (originalValue) {
          if (
            originalValue.hour() !== value.hour() ||
            originalValue.minute() !== value.minute() ||
            originalValue.second() !== value.second()
          ) {
            // keep other fields for rc-calendar
            const changedValue = originalValue.clone();
            changedValue.hour(value.hour());
            changedValue.minute(value.minute());
            changedValue.second(value.second());
            onChange(changedValue);
          }
        } else if (originalValue !== value) {
          onChange(value);
        }
      }
    } else {
      const str = event.target.value;
      this.setState({
        str,
      });
      const {
        format,
        hourOptions,
        minuteOptions,
        secondOptions,
        disabledHours,
        disabledMinutes,
        disabledSeconds,
        onChange,
      } = this.props;

      if (str) {
        const { value: originalValue } = this.props;
        const value = this.getProtoValue().clone();
        const parsed = moment(str, format, true);
        if (!parsed.isValid()) {
          this.setState({
            invalid: true,
          });
          return;
        }
        value
          .hour(parsed.hour())
          .minute(parsed.minute())
          .second(parsed.second());

        // if time value not allowed, response warning.
        if (
          hourOptions.indexOf(value.hour()) < 0 ||
          minuteOptions.indexOf(value.minute()) < 0 ||
          secondOptions.indexOf(value.second()) < 0
        ) {
          this.setState({
            invalid: true,
          });
          return;
        }

        // if time value is disabled, response warning.
        const disabledHourOptions = disabledHours();
        const disabledMinuteOptions = disabledMinutes(value.hour());
        const disabledSecondOptions = disabledSeconds(
          value.hour(),
          value.minute()
        );
        if (
          (disabledHourOptions &&
            disabledHourOptions.indexOf(value.hour()) >= 0) ||
          (disabledMinuteOptions &&
            disabledMinuteOptions.indexOf(value.minute()) >= 0) ||
          (disabledSecondOptions &&
            disabledSecondOptions.indexOf(value.second()) >= 0)
        ) {
          this.setState({
            invalid: true,
          });
          return;
        }

        if (originalValue) {
          if (
            originalValue.hour() !== value.hour() ||
            originalValue.minute() !== value.minute() ||
            originalValue.second() !== value.second()
          ) {
            // keep other fields for rc-calendar
            const changedValue = originalValue.clone();
            changedValue.hour(value.hour());
            changedValue.minute(value.minute());
            changedValue.second(value.second());
            onChange(changedValue);
          }
        } else if (originalValue !== value) {
          onChange(value);
        }
      } else {
        onChange(null);
      }

      this.setState({
        invalid: false,
      });
    }
  };
  // onInputChange = event => {
  //   const str = event.target.value;
  //   this.setState({
  //     str,
  //   });
  //   const {
  //     format,
  //     hourOptions,
  //     minuteOptions,
  //     secondOptions,
  //     disabledHours,
  //     disabledMinutes,
  //     disabledSeconds,
  //     onChange,
  //   } = this.props;

  //   if (str) {
  //     const { value: originalValue } = this.props;
  //     const value = this.getProtoValue().clone();
  //     const parsed = moment(str, format, true);
  //     if (!parsed.isValid()) {
  //       this.setState({
  //         invalid: true,
  //       });
  //       return;
  //     }
  //     value
  //       .hour(parsed.hour())
  //       .minute(parsed.minute())
  //       .second(parsed.second());

  //     // if time value not allowed, response warning.
  //     if (
  //       hourOptions.indexOf(value.hour()) < 0 ||
  //       minuteOptions.indexOf(value.minute()) < 0 ||
  //       secondOptions.indexOf(value.second()) < 0
  //     ) {
  //       this.setState({
  //         invalid: true,
  //       });
  //       return;
  //     }

  //     // if time value is disabled, response warning.
  //     const disabledHourOptions = disabledHours();
  //     const disabledMinuteOptions = disabledMinutes(value.hour());
  //     const disabledSecondOptions = disabledSeconds(value.hour(), value.minute());
  //     if (
  //       (disabledHourOptions && disabledHourOptions.indexOf(value.hour()) >= 0) ||
  //       (disabledMinuteOptions && disabledMinuteOptions.indexOf(value.minute()) >= 0) ||
  //       (disabledSecondOptions && disabledSecondOptions.indexOf(value.second()) >= 0)
  //     ) {
  //       this.setState({
  //         invalid: true,
  //       });
  //       return;
  //     }

  //     if (originalValue) {
  //       if (
  //         originalValue.hour() !== value.hour() ||
  //         originalValue.minute() !== value.minute() ||
  //         originalValue.second() !== value.second()
  //       ) {
  //         // keep other fields for rc-calendar
  //         const changedValue = originalValue.clone();
  //         changedValue.hour(value.hour());
  //         changedValue.minute(value.minute());
  //         changedValue.second(value.second());
  //         onChange(changedValue);
  //       }
  //     } else if (originalValue !== value) {
  //       onChange(value);
  //     }
  //   } else {
  //     onChange(null);
  //   }

  //   this.setState({
  //     invalid: false,
  //   });
  // };

  onKeyDown = (e) => {
    const { onEsc, onKeyDown } = this.props;
    if (e.keyCode === 27) {
      onEsc();
    }

    onKeyDown(e);
  };

  getProtoValue() {
    const { value, defaultOpenValue } = this.props;
    return value || defaultOpenValue;
  }

  getInput() {
    const { prefixCls, placeholder, inputReadOnly } = this.props;
    const { invalid, str } = this.state;
    const invalidClass = invalid ? `${prefixCls}-input-invalid` : "";
    return (
      <input
        className={classNames(`${prefixCls}-input`, invalidClass)}
        ref={(ref) => {
          this.refInput = ref;
        }}
        onKeyDown={this.onKeyDown}
        value={str}
        placeholder={placeholder}
        onChange={this.onInputChange}
        readOnly={!!inputReadOnly}
      />
    );
  }

  render() {
    const { prefixCls } = this.props;
    return <div className={`${prefixCls}-input-wrap`}>{this.getInput()}</div>;
  }
}

export default Header;
