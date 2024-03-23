const EColors = Object.freeze({
    WHITE: {
      hash: '#FFFFFF',
      hex: '0xFFFFFF',
      DARK: { hash: '#DDDDDD', hex: '0x0873B9' },
      LIGHT: { hash: '#FFFFFF', hex: '0xFFFFFF' },
    },
    GREY: {
      hash: '#666666',
      hex: '0x666666',
      DARK: { hash: '#444444', hex: '0x444444' },
      LIGHT: { hash: '#AAAAAA', hex: '0xAAAAAA' },
    },
    BLACK: {
      hash: '#000000',
      hex: '0x000000',
      DARK: { hash: '#000000', hex: '0x0873B9' },
      LIGHT: { hash: '#222222', hex: '0x0873B9' },
    },
    RED: {
      hash: '#aa2922',
      hex: '0xaa2922',
      DARK: { hash: '#000000', hex: '0x0873B9' },
      LIGHT: { hash: '#222222', hex: '0x0873B9' },
    },
    GREEN: {
      hash: '#001205',
      hex: '0x001205',
      DARK: { hash: '#000000', hex: '0x0873B9' },
      LIGHT: { hash: '#222222', hex: '0x0873B9' },
    },
  });
  
  const ETextStyle = Object.freeze({
    DEFAULT: {
      fontFamily: 'Quicksand',
      fontSize: 40,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    BUTTON: {
      fontFamily: 'Quicksand',
      fontSize: 40,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    UPGRADE_BUTTON_TITLE: {
      fontFamily: 'QuicksandBold',
      fontSize: 18,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    UPGRADE_BUTTON_BIG: {
      fontFamily: 'QuicksandBold',
      fontSize: 18,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    UPGRADE_BUTTON_SMALL: {
      fontFamily: 'Quicksand',
      fontSize: 15,
      color: EColors.GREEN.hash,
      align: 'center',
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    UI_BIG: {
      fontFamily: 'QuicksandBold',
      fontSize: 65,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    HEADER: {
      fontFamily: 'QuicksandBold',
      fontSize: 20,
      color: EColors.RED.hash,
      align: 'left',
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    GAMEPLAYVALUES: {
      fontFamily: 'QuicksandBold',
      fontSize: 20,
      color: EColors.BLACK.hash,
      align: 'left',
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    TIMER: {
      fontFamily: 'Quicksand',
      fontSize: 30,
      color: EColors.WHITE.hash,
      align: 'center',
      stroke: '#000000',
      strokeThickness: 3,
      shadow: {
        offsetX: 2,
        offsetY: 2,
        color: '#000000',
        blur: 0,
        stroke: false,
        fill: true
      },
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    INVENTORY: {
      fontFamily: 'QuicksandBold',
      fontSize: 35,
      color: EColors.RED.hash,
      align: 'center',
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
    INCOME: {
      fontFamily: 'Quicksand',
      fontSize: 20,
      color: EColors.RED.hash,
      align: 'center',
      wordWrap: { width: 450, useAdvancedWrap: true },
    },
  });
  
  module.exports = {
    ETextStyle,
    EColors,
  };