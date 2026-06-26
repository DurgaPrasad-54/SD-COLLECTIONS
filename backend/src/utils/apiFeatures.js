/**
 * Reusable API Features class for query building.
 * Supports: search, filter, sort, field selection, pagination.
 *
 * Usage:
 *   const features = new APIFeatures(Model.find(), req.query)
 *     .search('name')
 *     .filter()
 *     .sort()
 *     .limitFields()
 *     .paginate();
 *   const docs = await features.query;
 */
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Text search on a given field.
   * ?keyword=shirt
   */
  search(field = 'name') {
    if (this.queryString.keyword) {
      const regex = { [field]: { $regex: this.queryString.keyword, $options: 'i' } };
      this.query = this.query.find(regex);
    }
    return this;
  }

  /**
   * Advanced filtering with comparison operators.
   * ?price[gte]=100&price[lte]=500&category=xyz
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludeFields = ['keyword', 'sort', 'fields', 'page', 'limit'];
    excludeFields.forEach((field) => delete queryObj[field]);

    // Convert operators: gte, gt, lte, lt → $gte, $gt, $lte, $lt
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sorting.
   * ?sort=price,-createdAt  (default: -createdAt)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Field selection / projection.
   * ?fields=name,price,category
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Pagination.
   * ?page=2&limit=10  (default: page 1, limit 12)
   */
  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 12;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
