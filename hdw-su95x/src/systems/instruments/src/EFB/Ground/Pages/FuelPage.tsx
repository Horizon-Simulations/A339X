/* eslint-disable max-len */
import React, { useState } from 'react';
import { round } from 'lodash';
import { CloudArrowDown, PlayFill, StopCircleFill } from 'react-bootstrap-icons';
import { useSimVar, Units, usePersistentNumberProperty, usePersistentProperty } from '@flybywiresim/fbw-sdk';
import Slider from 'rc-slider';
import { t } from '../../translation';
import { TooltipWrapper } from '../../UtilComponents/TooltipWrapper';
import { isSimbriefDataLoaded } from '../../Store/features/simBrief';
import { useAppSelector } from '../../Store/store';
import { SelectGroup, SelectItem } from '../../UtilComponents/Form/Select';
import { ProgressBar } from '../../UtilComponents/Progress/Progress';
import { SimpleInput } from '../../UtilComponents/Form/SimpleInput/SimpleInput';
import { OverWingOutline } from '../../Assets/OverWingOutline';

interface TankReadoutProps {
    title: string;
    current: number;
    target: number;
    capacity: number;
    currentUnit: string;
    tankValue: number;
    convertedFuelValue: number;
    className?: string;
    inlinedTitle?: boolean;
    width?: number;
}

const TankReadoutWidget = ({ title, current, target, capacity, currentUnit, tankValue, convertedFuelValue, className, inlinedTitle, width = 366 }: TankReadoutProps) => {
    const getFuelBarPercent = (curr: number, max: number) => (Math.max(curr, 0) / max) * 100;

    return (
        <div className={`bg-theme-body w-min space-y-3 overflow-hidden p-4 ${className}`} style={{ width: `${width}px` }}>
            <div className={inlinedTitle ? 'flex flex-row items-center justify-between' : undefined}>
                <h2>{title}</h2>
                <p>{`${convertedFuelValue}/${round(tankValue)} ${currentUnit}`}</p>
            </div>
            <ProgressBar
                height="20px"
                width={`${width - 40}px`}
                displayBar={false}
                completedBarBegin={getFuelBarPercent(target, capacity)}
                isLabelVisible={false}
                bgcolor="var(--color-highlight)"
                completed={(Math.max(current, 0) / capacity) * 100}
            />
        </div>
    );
};

export const FuelPage = () => {
    const [totalFuelGallons] = useSimVar('FUEL TOTAL CAPACITY', 'Gallons', 1_000);
    const [outerCellGallons] = useSimVar('FUEL TANK LEFT AUX CAPACITY', 'Gallons', 1_000);
    const [innerCellGallons] = useSimVar('FUEL TANK LEFT MAIN CAPACITY', 'Gallons', 1_000);
    const [centerTankGallons] = useSimVar('FUEL TANK CENTER CAPACITY', 'Gallons', 1_000);

    const wingTotalRefuelTimeSeconds = 624;
    const CenterTotalRefuelTimeSeconds = 336;



    const { usingMetric } = Units;
    const [currentUnit] = useState(usingMetric ? 'KG' : 'LB');
    const [convertUnit] = useState(usingMetric ? 1 : (1 / 0.4535934));

    const [galToKg] = useSimVar('FUEL WEIGHT PER GALLON', 'kilograms', 1_000);
    const outerCell = () => outerCellGallons * galToKg * convertUnit;
    const outerCells = () => outerCell() * 2;
    const innerCell = () => innerCellGallons * galToKg * convertUnit;
    const innerCells = () => innerCell() * 2;
    const centerTank = () => centerTankGallons * galToKg * convertUnit;
    const totalFuel = () => centerTank() + innerCells() + outerCells();
    const [busDC2] = useSimVar('L:A32NX_ELEC_DC_2_BUS_IS_POWERED', 'Bool', 1_000);
    const [busDCHot1] = useSimVar('L:A32NX_ELEC_DC_HOT_1_BUS_IS_POWERED', 'Bool', 1_000);
    const [simGroundSpeed] = useSimVar('GPS GROUND SPEED', 'knots', 1_000);
    const [isOnGround] = useSimVar('SIM ON GROUND', 'Bool', 1_000);
    const [eng1Running] = useSimVar('ENG COMBUSTION:1', 'Bool', 1_000);
    const [eng2Running] = useSimVar('ENG COMBUSTION:2', 'Bool', 1_000);
    const [refuelRate, setRefuelRate] = usePersistentProperty('REFUEL_RATE_SETTING');
    const [sliderValue, setSliderValue] = useSimVar('L:A32NX_FUEL_DESIRED_PERCENT', 'Number');
    const [inputValue, setInputValue] = useSimVar('L:A32NX_FUEL_DESIRED', 'Number');
    const [totalTarget, setTotalTarget] = useSimVar('L:A32NX_FUEL_TOTAL_DESIRED', 'Number');
    const [refuelStartedByUser, setRefuelStartedByUser] = useSimVar('L:A32NX_REFUEL_STARTED_BY_USR', 'Bool');
    const [centerTarget, setCenterTarget] = useSimVar('L:A32NX_FUEL_CENTER_DESIRED', 'Number');
    const [LInnTarget, setLInnTarget] = useSimVar('L:A32NX_FUEL_LEFT_MAIN_DESIRED', 'Number');
    const [LOutTarget, setLOutTarget] = useSimVar('L:A32NX_FUEL_LEFT_AUX_DESIRED', 'Number');
    const [RInnTarget, setRInnTarget] = useSimVar('L:A32NX_FUEL_RIGHT_MAIN_DESIRED', 'Number');
    const [ROutTarget, setROutTarget] = useSimVar('L:A32NX_FUEL_RIGHT_AUX_DESIRED', 'Number');
    const [centerCurrent] = useSimVar('FUEL TANK CENTER QUANTITY', 'Gallons', 1_000);
    const [LInnCurrent] = useSimVar('FUEL TANK LEFT MAIN QUANTITY', 'Gallons', 1_000);
    const [LOutCurrent] = useSimVar('FUEL TANK LEFT AUX QUANTITY', 'Gallons', 1_000);
    const [RInnCurrent] = useSimVar('FUEL TANK RIGHT MAIN QUANTITY', 'Gallons', 1_000);
    const [ROutCurrent] = useSimVar('FUEL TANK RIGHT AUX QUANTITY', 'Gallons', 1_000);

    // GSX
    const [gsxFuelSyncEnabled] = usePersistentNumberProperty('GSX_FUEL_SYNC', 0);
    const [gsxFuelHoseConnected] = useSimVar('L:FSDT_GSX_FUELHOSE_CONNECTED', 'Number');
    const [gsxRefuelState] = useSimVar('L:FSDT_GSX_REFUELING_STATE', 'Number');

    const { units } = useAppSelector((state) => state.simbrief.data);
    const { planRamp } = useAppSelector((state) => state.simbrief.data.fuels);
    const simbriefDataLoaded = isSimbriefDataLoaded();

    const gsxRefuelActive = () => (gsxRefuelState === 4 || gsxRefuelState === 5);

    const isAirplaneCnD = () => !(simGroundSpeed > 0.1 || eng1Running || eng2Running || !isOnGround || (!busDC2 && !busDCHot1));

    const airplaneCanRefuel = () => {
        if (refuelRate !== '2') {
            if (!isAirplaneCnD()) {
                setRefuelRate('2');
            }
        }

        if (gsxFuelSyncEnabled === 1) {
            if (gsxFuelHoseConnected === 1 || refuelRate === '2') {
                return true;
            }

            // In-flight refueling with GSX Sync enabled
            return !isAirplaneCnD() && refuelRate === '2';
        }

        return true;
    };

    const currentWingFuel = () => round(Math.max((LInnCurrent + (LOutCurrent) + (RInnCurrent) + (ROutCurrent)), 0));
    const targetWingFuel = () => round(Math.max((LInnTarget + (LOutTarget) + (RInnTarget) + (ROutTarget)), 0));
    const convertToGallon = (curr : number) => curr * (1 / convertUnit) * (1 / galToKg);
    const totalCurrentGallon = () => round(Math.max((LInnCurrent + (LOutCurrent) + (RInnCurrent) + (ROutCurrent) + (centerCurrent)), 0));

    const totalCurrent = () => {
        if (round(totalTarget) === totalCurrentGallon()) {
            return inputValue;
        }
        const val = round(totalCurrentGallon() * getFuelMultiplier());
        if (centerCurrent > 0 && centerCurrent < centerTankGallons) {
            return round(val + convertUnit);
        }
        return val;
    };

    const formatRefuelStatusLabel = () => {
        if (airplaneCanRefuel()) {
            if (round(totalTarget) === totalCurrentGallon()) {
                return `(${t('Ground.Fuel.Completed')})`;
            }
            if (refuelStartedByUser) {
                return ((totalTarget) > (totalCurrentGallon())) ? `(${t('Ground.Fuel.Refueling')}...)` : `(${t('Ground.Fuel.Defueling')}...)`;
            }
            return `(${t('Ground.Fuel.ReadyToStart')})`;
        }
        if (refuelStartedByUser) {
            setRefuelStartedByUser(false);
        }
        if (gsxFuelSyncEnabled === 1) {
            if (!gsxRefuelActive()) {
                return `(${t('Ground.Fuel.GSXFuelSyncEnabled')})`;
            }

            return '';
        }
        return `(${t('Ground.Fuel.Unavailable')})`;
    };

    const formatRefuelStatusClass = () => {
        if (airplaneCanRefuel()) {
            if (round(totalTarget) === totalCurrentGallon() || !refuelStartedByUser) {
                if (refuelStartedByUser) {
                    setRefuelStartedByUser(false);
                }
                return 'text-theme-highlight';
            }
            return ((totalTarget) > (totalCurrentGallon())) ? 'text-green-500' : 'text-yellow-500';
        }
        if (gsxFuelSyncEnabled && !gsxRefuelActive()) {
            return 'text-theme-highlight';
        }
        return 'text-theme-accent';
    };

    const getFuelMultiplier = () => galToKg * convertUnit;

    const formatFuelFilling = (curr: number, max: number) => {
        const percent = (Math.max(curr, 0) / max) * 100;
        return `linear-gradient(to top, var(--color-highlight) ${percent}%,#ffffff00 0%)`;
    };

    const convertFuelValue = (curr: number) => round(round(Math.max(curr, 0)) * getFuelMultiplier());

    const convertFuelValueCenter = (curr: number) => {
        if (curr < 1) {
            return 0;
        }
        if (curr === centerTankGallons) {
            return convertFuelValue(curr);
        }
        return round(convertFuelValue(curr) + convertUnit);
    };

    const setDesiredFuel = (fuel: number) => {
        fuel -= (outerCellGallons) * 2;
        const outerTank = (((outerCellGallons) * 2) + Math.min(fuel, 0)) / 2;
        setLOutTarget(outerTank);
        setROutTarget(outerTank);
        if (fuel <= 0) {
            setLInnTarget(0);
            setRInnTarget(0);
            setCenterTarget(0);
            return;
        }
        fuel -= (innerCellGallons) * 2;
        const innerTank = (((innerCellGallons) * 2) + Math.min(fuel, 0)) / 2;
        setLInnTarget(innerTank);
        setRInnTarget(innerTank);
        if (fuel <= 0) {
            setCenterTarget(0);
            return;
        }
        setCenterTarget(fuel);
    };

    const updateDesiredFuel = (value: string) => {
        let fuel = 0;
        let originalFuel = 0;
        if (value.length > 0) {
            originalFuel = parseInt(value);
            fuel = convertToGallon(originalFuel);
            if (originalFuel > totalFuel()) {
                originalFuel = round(totalFuel());
            }
            setInputValue(originalFuel);
        }
        if (fuel > totalFuelGallons) {
            fuel = totalFuelGallons + 2;
        }
        setTotalTarget(fuel);
        setSliderValue((fuel / totalFuelGallons) * 100);
        setDesiredFuel(fuel);
    };

    const updateSlider = (value: number) => {
        if (value < 2) {
            value = 0;
        }
        setSliderValue(value);
        const fuel = Math.round(totalFuel() * (value / 100));
        updateDesiredFuel(fuel.toString());
    };

    const calculateEta = () => {
        if (round(totalTarget) === totalCurrentGallon() || refuelRate === '2') { // instant
            return ' 0';
        }
        let estimatedTimeSeconds = 0;
        const totalWingFuel = totalFuelGallons - centerTankGallons;
        const differentialFuelWings = Math.abs(currentWingFuel() - targetWingFuel());
        const differentialFuelCenter = Math.abs(centerTarget - centerCurrent);
        estimatedTimeSeconds += (differentialFuelWings / totalWingFuel) * wingTotalRefuelTimeSeconds;
        estimatedTimeSeconds += (differentialFuelCenter / centerTankGallons) * CenterTotalRefuelTimeSeconds;
        if (refuelRate === '1') { // fast
            estimatedTimeSeconds /= 5;
        }
        if (estimatedTimeSeconds < 35) {
            return ' 0.5';
        }
        return ` ${Math.round(estimatedTimeSeconds / 60)}`;
    };

    const switchRefuelState = () => {
        if (airplaneCanRefuel()) {
            setRefuelStartedByUser(!refuelStartedByUser);
        }
    };

    const handleFuelAutoFill = () => {
        let fuelToLoad = -1;

        if (usingMetric) {
            if (units === 'kgs') {
                fuelToLoad = roundUpNearest100(planRamp);
            } else {
                fuelToLoad = roundUpNearest100(Units.poundToKilogram(planRamp));
            }
        } else if (units === 'kgs') {
            fuelToLoad = roundUpNearest100(Units.kilogramToPound(planRamp));
        } else {
            fuelToLoad = roundUpNearest100(planRamp);
        }

        updateDesiredFuel(fuelToLoad.toString());
    };

    const roundUpNearest100 = (plannedFuel: number) => Math.ceil(plannedFuel / 100) * 100;

    return (
        <div className="h-content-section-reduced relative mt-6 flex flex-col justify-between">
            <div className="z-30">
                <div className="absolute inset-x-0 top-0 mx-auto flex flex-col items-center space-y-3">
                    <TankReadoutWidget
                        title={t('Ground.Fuel.TotalFuel')}
                        current={totalCurrent()}
                        target={totalTarget}
                        capacity={totalFuel()}
                        currentUnit={currentUnit}
                        tankValue={totalFuel()}
                        convertedFuelValue={totalCurrent()}
                        className="border-theme-accent overflow-hidden rounded-2xl border-2"
                        inlinedTitle
                        width={420}
                    />
                    <TankReadoutWidget
                        title={t('Ground.Fuel.CenterTank')}
                        current={centerCurrent}
                        target={centerTarget}
                        capacity={centerTankGallons}
                        currentUnit={currentUnit}
                        tankValue={centerTank()}
                        convertedFuelValue={convertFuelValueCenter(centerCurrent)}
                        className="border-theme-accent overflow-hidden rounded-2xl border-2"
                        inlinedTitle
                        width={420}
                    />
                </div>
                <div className="absolute inset-x-0 top-40 flex flex-row justify-between">
                    <div className="border-theme-accent divide-theme-accent w-min divide-y overflow-hidden rounded-2xl border-2">
                        <TankReadoutWidget
                            title={t('Ground.Fuel.LeftInnerTank')}
                            current={LInnCurrent}
                            target={LInnTarget}
                            capacity={innerCellGallons}
                            currentUnit={currentUnit}
                            tankValue={innerCell()}
                            convertedFuelValue={convertFuelValue(LInnCurrent)}
                        />
                        <TankReadoutWidget
                            title={t('Ground.Fuel.LeftOuterTank')}
                            current={LOutCurrent}
                            target={LOutTarget}
                            capacity={outerCellGallons}
                            currentUnit={currentUnit}
                            tankValue={outerCell()}
                            convertedFuelValue={convertFuelValueCenter(LOutCurrent)}
                        />
                    </div>
                    <div className="border-theme-accent divide-theme-accent w-min divide-y overflow-hidden rounded-2xl border-2">
                        <TankReadoutWidget
                            title={t('Ground.Fuel.RightInnerTank')}
                            current={RInnCurrent}
                            target={RInnTarget}
                            capacity={innerCellGallons}
                            currentUnit={currentUnit}
                            tankValue={innerCell()}
                            convertedFuelValue={convertFuelValueCenter(RInnCurrent)}
                        />
                        <TankReadoutWidget
                            title={t('Ground.Fuel.RightOuterTank')}
                            current={ROutCurrent}
                            target={ROutTarget}
                            capacity={outerCellGallons}
                            currentUnit={currentUnit}
                            tankValue={outerCell()}
                            convertedFuelValue={convertFuelValueCenter(ROutCurrent)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-center justify-end">
                {/* FIXME TODO: Replace with Tailwind JIT values later */}
                <div className="absolute inset-x-0 bottom-0" style={{ transform: 'translate(0px, -150px)' }}>
                    <OverWingOutline className="absolute bottom-0 left-0 z-20" />

                    <div
                        className="absolute z-20"
                        style={{ width: '137px', height: '110px', bottom: '243px', left: '572px', background: formatFuelFilling(centerCurrent, centerTankGallons) }}
                    />
                    <div
                        className="absolute z-0"
                        style={{ width: '310px', height: '215px', bottom: '140px', left: '260px', background: formatFuelFilling(LInnCurrent, innerCellGallons) }}
                    />
                    <div
                        className="absolute z-0"
                        style={{ width: '310px', height: '215px', bottom: '140px', right: '260px', background: formatFuelFilling(RInnCurrent, innerCellGallons) }}
                    />
                    <div
                        className="absolute z-0"
                        style={{ width: '122px', height: '98px', bottom: '100px', left: '138px', background: formatFuelFilling(LOutCurrent, outerCellGallons) }}
                    />
                    <div
                        className="absolute z-0"
                        style={{ width: '122px', height: '98px', bottom: '100px', right: '138px', background: formatFuelFilling(ROutCurrent, outerCellGallons) }}
                    />
                    {/* tl overlay */}
                    <div
                        className="bottom-overlay-t-y left-overlay-tl bg-theme-body -rotate-26.5 absolute z-10"
                        style={{ transform: 'rotate(-26.5deg)', width: '490px', height: '140px', bottom: '240px', left: '82px' }}
                    />
                    {/* tr overlay */}
                    <div
                        className="right-overlay-tr bottom-overlay-t-y bg-theme-body rotate-26.5 absolute z-10"
                        style={{ transform: 'rotate(26.5deg)', width: '490px', height: '140px', bottom: '240px', right: '82px' }}
                    />
                    {/* bl overlay */}
                    <div
                        className="bottom-overlay-b-y left-overlay-bl bg-theme-body -rotate-18.5 absolute z-10"
                        style={{ transform: 'rotate(-18.5deg)', width: '484px', height: '101px', bottom: '78px', left: '144px' }}
                    />
                    {/* br overlay */}
                    <div
                        className="right-overlay-br bottom-overlay-b-y bg-theme-body rotate-18.5 absolute z-10"
                        style={{ transform: 'rotate(18.5deg)', width: '484px', height: '101px', bottom: '78px', right: '144px' }}
                    />
                </div>

                <div className="border-theme-accentborder-2 absolute bottom-0 left-0 z-10 flex max-w-3xl flex-row overflow-x-hidden rounded-2xl border">
                    <div className="space-y-4 px-5 py-3">
                        <div className="flex flex-row items-center justify-between">
                            <div className="flex flex-row items-center space-x-3">
                                <h2 className="font-medium">{t('Ground.Fuel.Refuel')}</h2>
                                <p className={formatRefuelStatusClass()}>{formatRefuelStatusLabel()}</p>
                            </div>
                            <p>{`${t('Ground.Fuel.EstimatedDuration')}: ${calculateEta()}`}</p>
                        </div>
                        <div className="flex flex-row items-center space-x-6">
                            <Slider
                                style={{ width: '28rem' }}
                                value={sliderValue}
                                onChange={updateSlider}
                            />
                            <div className="flex flex-row">
                                <div className="relative">
                                    <SimpleInput
                                        className={`w-32 ${simbriefDataLoaded && 'rounded-r-none'}`}
                                        placeholder={round(totalFuel()).toString()}
                                        number
                                        min={0}
                                        max={round(totalFuel())}
                                        value={inputValue}
                                        onChange={(x) => updateDesiredFuel(x)}
                                    />
                                    <div className="absolute right-4 top-2 text-lg text-gray-400">{currentUnit}</div>
                                </div>
                                {simbriefDataLoaded && (
                                    <TooltipWrapper text={t('Ground.Fuel.TT.FillBlockFuelFromSimBrief')}>
                                        <div
                                            className="text-theme-body hover:text-theme-highlight bg-theme-highlight hover:bg-theme-body border-theme-highlight flex h-auto items-center justify-center rounded-md rounded-l-none border-2 px-2 transition duration-100"
                                            onClick={simbriefDataLoaded ? handleFuelAutoFill : undefined}
                                        >
                                            <CloudArrowDown size={26} />
                                        </div>
                                    </TooltipWrapper>
                                )}
                            </div>
                        </div>
                    </div>

                    {(!gsxFuelSyncEnabled || refuelRate === '2') && (
                        <div
                            className={`flex w-20 items-center justify-center ${formatRefuelStatusClass()} bg-current`}
                            onClick={() => switchRefuelState()}
                        >
                            <div className={`${airplaneCanRefuel() ? 'text-white' : 'text-theme-unselected'}`}>
                                <PlayFill size={50} className={refuelStartedByUser ? 'hidden' : ''} />
                                <StopCircleFill size={50} className={refuelStartedByUser ? '' : 'hidden'} />
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-theme-accent absolute bottom-0 right-6 flex flex-col items-center justify-center space-y-2 overflow-x-hidden rounded-2xl border px-6 py-3">
                    <h2 className="flex font-medium">{t('Ground.Fuel.RefuelTime')}</h2>

                    <SelectGroup>
                        <SelectItem selected={isAirplaneCnD() ? refuelRate === '2' : !isAirplaneCnD()} onSelect={() => setRefuelRate('2')}>{t('Settings.Instant')}</SelectItem>

                        <TooltipWrapper text={`${!isAirplaneCnD() && t('Ground.Fuel.TT.AircraftMustBeColdAndDarkToChangeRefuelTimes')}`}>
                            <div>
                                <SelectItem className={`${!isAirplaneCnD() && 'opacity-20'}`} disabled={!isAirplaneCnD()} selected={refuelRate === '1'} onSelect={() => setRefuelRate('1')}>{t('Settings.Fast')}</SelectItem>
                            </div>
                        </TooltipWrapper>

                        <TooltipWrapper text={`${!isAirplaneCnD() && t('Ground.Fuel.TT.AircraftMustBeColdAndDarkToChangeRefuelTimes')}`}>
                            <div>
                                <SelectItem className={`${!isAirplaneCnD() && 'opacity-20'}`} disabled={!isAirplaneCnD()} selected={refuelRate === '0'} onSelect={() => setRefuelRate('0')}>{t('Settings.Real')}</SelectItem>
                            </div>
                        </TooltipWrapper>
                    </SelectGroup>
                </div>
            </div>
        </div>
    );
};
