module.exports.findMidPoint = function(firstUserPoint, secondUserPoint) {
   var midpointLatitude = (firstUserPoint[0] + secondUserPoint[0]) / 2;
   var midpointLongitude = (firstUserPoint[1] + secondUserPoint[1]) / 2;

   var midpoint = [Number(midpointLatitude.toFixed(5)), Number(midpointLongitude.toFixed(5))];
   return midpoint;
}