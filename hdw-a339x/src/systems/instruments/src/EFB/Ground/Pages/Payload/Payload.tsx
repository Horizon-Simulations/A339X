// Copyright (c) 2021-2023 FlyByWire Simulations
//
// SPDX-License-Identifier: GPL-3.0

/* eslint-disable max-len */
import React, { useState } from 'react';
import { Units, usePersistentProperty, useSimVar } from '@flybywiresim/fbw-sdk';
import { getAirframeType } from '../../../Efb';
import { A330Payload } from './A330_941/A330Payload';
import { ACJ330Payload} from './ACJ330_941/A330Payload';
import { useAppSelector } from '../../../Store/store';
import { isSimbriefDataLoaded } from '../../../Store/features/simBrief';

export const Payload = () => {
    const simbriefUnits = useAppSelector((state) => state.simbrief.data.units);
    const simbriefBagWeight = parseInt(useAppSelector((state) => state.simbrief.data.weights.bagWeight));
    const simbriefPaxWeight = parseInt(useAppSelector((state) => state.simbrief.data.weights.passengerWeight));
    const simbriefPax = parseInt(useAppSelector((state) => state.simbrief.data.weights.passengerCount));
    const simbriefBag = parseInt(useAppSelector((state) => state.simbrief.data.weights.bagCount));
    const simbriefFreight = parseInt(useAppSelector((state) => state.simbrief.data.weights.freight));

    const [isOnGround] = useSimVar('SIM ON GROUND', 'Bool', 8_059);
    const [boardingStarted, setBoardingStarted] = useSimVar('L:A32NX_BOARDING_STARTED_BY_USR', 'Bool', 509);
    const [boardingRate, setBoardingRate] = usePersistentProperty('CONFIG_BOARDING_RATE', 'REAL');

    const simbriefDataLoaded = isSimbriefDataLoaded();

    const [massUnitForDisplay] = useState(Units.usingMetric ? 'KGS' : 'LBS');

    switch (getAirframeType()) {
        case 'ACJ330_941':
            return (
                <ACJ330Payload
                    simbriefUnits={simbriefUnits}
                    simbriefBagWeight={simbriefBagWeight}
                    simbriefPaxWeight={simbriefPaxWeight}
                    simbriefPax={simbriefPax}
                    simbriefBag={simbriefBag}
                    simbriefFreight={simbriefFreight}
                    simbriefDataLoaded={simbriefDataLoaded}
                    massUnitForDisplay={massUnitForDisplay}
                    isOnGround={isOnGround}
                    boardingStarted={boardingStarted}
                    boardingRate={boardingRate}
                    setBoardingStarted={setBoardingStarted}
                    setBoardingRate={setBoardingRate}
                />
            );
        case 'A330_941':
        default:
            return (
                <A330Payload
                    simbriefUnits={simbriefUnits}
                    simbriefBagWeight={simbriefBagWeight}
                    simbriefPaxWeight={simbriefPaxWeight}
                    simbriefPax={simbriefPax}
                    simbriefBag={simbriefBag}
                    simbriefFreight={simbriefFreight}
                    simbriefDataLoaded={simbriefDataLoaded}
                    massUnitForDisplay={massUnitForDisplay}
                    isOnGround={isOnGround}
                    boardingStarted={boardingStarted}
                    boardingRate={boardingRate}
                    setBoardingStarted={setBoardingStarted}
                    setBoardingRate={setBoardingRate}
                />
            );
    }
};
