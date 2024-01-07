const { TourModel } = require("../models/Tour");

class ApiFeatures {
   constructor (query, queryObj) {
      this.query = query
      this.queryObj = queryObj
   }
   filter(){
      const filter = this.queryObj?.filter || '{}';
      this.query = TourModel.find(JSON.parse(filter))
      return this
   }
   sorting(){
      const sort = 
      new String(this.queryObj?.sort) != 'undefined'
        ? this.queryObj?.sort.split(',').join(' ')
        : '_id';
      this.query = this.query.sort(sort);
      return this
   }
   projection(){
      const projection =
      new String(this.queryObj?.projection) != 'undefined'
        ? this.queryObj?.projection.split(',').join(' ')
        : '';
      this.query = this.query.select(projection);
      return this
   }
   pagination(){
      const page = this.queryObj?.page * 1 || 1;
      const limit = this.queryObj?.limit * 1 || 10;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this
   }
}

module.exports = ApiFeatures