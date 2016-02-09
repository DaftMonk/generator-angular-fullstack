/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     <%= route %>              ->  index<% if (filters.models) { %>
 * POST    <%= route %>              ->  create
 * GET     <%= route %>/:id          ->  show
 * PUT     <%= route %>/:id          ->  update
 * DELETE  <%= route %>/:id          ->  destroy<% } %>
 */

'use strict';<% if (filters.models) { %>

import _ from 'lodash';<% if (filters.mongooseModels) { %>
import <%= classedName %> from './<%= basename %>.model';<% } if (filters.sequelizeModels) { %>
import {<%= classedName %>} from '<%= relativeRequire(config.get('registerModelsFile')) %>';<% } %>

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function(entity) {
    <% if (filters.mongooseModels) { %>v_.extend(entity, updates);
    return entity.saveAsync()
      .spread(entity => {<% }
       if (filters.sequelizeModels) { %>return entity.updateAttributes(updates)
      .then(entity => {<% } %>
        return entity;
      });
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      <% if (filters.mongooseModels) { %>return entity.removeAsync()<% }
         if (filters.sequelizeModels) { %>return entity.destroy()<% } %>
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}<% } %>

// Gets a list of <%= classedName %>s
export function index(req, res) {<% if (!filters.models) { %>
  res.json([]);<% } else { %>
  <% if (filters.mongooseModels) { %><%= classedName %>.findAsync()<% }
     if (filters.sequelizeModels) { %><%= classedName %>.findAll()<% } %>
    .then(respondWithResult(res))
    .catch(handleError(res));<% } %>
}<% if (filters.models) { %>

// Gets a single <%= classedName %> from the DB
export function show(req, res) {
  <% if (filters.mongooseModels) { %><%= classedName %>.findByIdAsync(req.params.id)<% }
     if (filters.sequelizeModels) { %><%= classedName %>.find({
    where: {
      _id: req.params.id
    }
  })<% } %>
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new <%= classedName %> in the DB
export function create(req, res) {
  <% if (filters.mongooseModels) { %><%= classedName %>.createAsync(req.body)<% }
     if (filters.sequelizeModels) { %><%= classedName %>.create(req.body)<% } %>
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing <%= classedName %> in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  <% if (filters.mongooseModels) { %><%= classedName %>.findByIdAsync(req.params.id)<% }
     if (filters.sequelizeModels) { %><%= classedName %>.find({
    where: {
      _id: req.params.id
    }
  })<% } %>
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a <%= classedName %> from the DB
export function destroy(req, res) {
  <% if (filters.mongooseModels) { %><%= classedName %>.findByIdAsync(req.params.id)<% }
     if (filters.sequelizeModels) { %><%= classedName %>.find({
    where: {
      _id: req.params.id
    }
  })<% } %>
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}<% } %>
