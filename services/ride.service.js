import Ride from "../models/ride.model.js";
import { getDistanceTime } from "./maps.service.js";
import crypto from "crypto";

const getFare = async (origin, destination) => {
    if (!origin || !destination) {
        throw new Error("Origin and destination are required to calculate fare");
    }

    const distanceTime = await getDistanceTime(origin, destination);

    const baseFare = {
        auto: 30,
        car: 50,
        moto: 20
    };

    const perKmRate = {
        auto: 10,
        car: 15,
        moto: 8
    };

    const perMinuteRate = {
        auto: 2,
        car: 3,
        moto: 1.5
    };



    const fare = {
        auto: Math.round(baseFare.auto + ((distanceTime.distance.value / 1000) * perKmRate.auto) + ((distanceTime.duration.value / 60) * perMinuteRate.auto)),
        car: Math.round(baseFare.car + ((distanceTime.distance.value / 1000) * perKmRate.car) + ((distanceTime.duration.value / 60) * perMinuteRate.car)),
        moto: Math.round(baseFare.moto + ((distanceTime.distance.value / 1000) * perKmRate.moto) + ((distanceTime.duration.value / 60) * perMinuteRate.moto))
    };

    return fare;
}

const getOtp = (num) => {
    function generateOtp(num) {
        const otp = crypto.randomInt(Math.pow(10, num - 1), Math.pow(10, num)).toString();
        return otp;
    }
    return generateOtp(num);
}


const createRide = async ({ userId, pickupLocation, destination, vehicleType, paymentMethod }) => {
    if (!userId || !pickupLocation || !destination || !vehicleType || !paymentMethod) {
        throw new Error("All fields are required to create a ride");
    }
    const fare = await getFare(pickupLocation, destination)
    const ride = Ride.create({
        user: userId,
        pickupLocation,
        destination,
        otp: getOtp(4),
        fare: fare[vehicleType],
        paymentMethod
    })
    return ride
}

const confirmRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error("rideId is required")
    }
    const ride = await Ride.findOneAndUpdate({ _id: rideId }, {
        status: "accepted",
        captain: captain._id
    }, {
        new: true
    }).populate("user").populate("captain").select("+otp")

    if (!ride) {
        throw new Error("ride not found")
    }
    return ride

}

const startRide = async ({ rideId, otp, captain }) => {
    if (!rideId || !otp) {
        throw new Error("rideId and otp are required")
    }

    const ride = await Ride.findOneAndUpdate({ _id: rideId, otp: otp, status: "accepted", captain: captain._id },
        {
            status: "ongoing"
        },
        {
            new: true
        }).populate("user").populate("captain")
        console.log(ride)

    if (!ride) {
        throw new Error("Invalid rideId or otp or ride is not accepted yet")
    }
    return ride
}

const endRide = async ({ rideId, captain }) => {
    if (!rideId) {
        throw new Error("rideId is required");
    }

    const ride = await Ride.findOneAndUpdate(
        {
            _id: rideId,
            status: "ongoing",
            captain: captain._id
        },
        {
            status: "completed"
        },
        {
            new: true
        }
    )
        .populate("user")
        .populate("captain");

    if (!ride) {
        throw new Error(
            "Invalid rideId or ride is not ongoing yet"
        );
    }

    return ride;
}

export { getFare, createRide, confirmRide, startRide, endRide };